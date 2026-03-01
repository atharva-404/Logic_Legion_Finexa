# ai_assistant/services/financial_health.py
"""
Financial Health Score Calculator
Calculates 0-100 financial health score based on 5 factors.
Uses the Transaction model (income/expense) and User.income (profile) as primary data sources.
"""
from decimal import Decimal
from datetime import datetime, timedelta, date as date_type
from django.db.models import Count
from django.utils import timezone
from ..models import WalletTransaction, Wallet, FinancialHealthScore, ScoreFactorDetail, Loan
from transactions.models import Transaction


class FinancialHealthCalculator:
    """
    Calculates financial health scores based on the user's real transaction data.
    """

    def __init__(self, user):
        self.user = user

    # ── helpers ────────────────────────────────────────────────────
    @staticmethod
    def _to_aware_datetime(d):
        """Convert a date or naive datetime to a timezone-aware datetime."""
        if isinstance(d, datetime):
            if timezone.is_naive(d):
                return timezone.make_aware(d)
            return d
        # It's a date object – convert to midnight aware datetime
        return timezone.make_aware(datetime(d.year, d.month, d.day))

    def _month_range(self, month_date):
        """Return (start, end) as timezone-aware datetimes for the given month."""
        if isinstance(month_date, datetime):
            base = month_date.date() if hasattr(month_date, 'date') else month_date
        else:
            base = month_date
        start = base.replace(day=1)
        if start.month == 12:
            end = start.replace(year=start.year + 1, month=1, day=1)
        else:
            end = start.replace(month=start.month + 1, day=1)
        return self._to_aware_datetime(start), self._to_aware_datetime(end)

    def _get_profile_income(self):
        """Monthly income set in the user profile (onboarding)."""
        return float(self.user.income or 0)

    def _get_transactions(self, start, end, tx_type=None):
        """Return queryset of Transaction objects for user in date range."""
        qs = Transaction.objects.filter(user=self.user, date__gte=start, date__lt=end)
        if tx_type:
            qs = qs.filter(type=tx_type)
        return qs

    def _total_income(self, start, end):
        """Best-effort income: max of transaction-based income and profile income."""
        tx_income = sum(float(t.amount or 0) for t in self._get_transactions(start, end, 'income'))
        return max(tx_income, self._get_profile_income())

    def _total_expenses(self, start, end):
        return sum(float(t.amount or 0) for t in self._get_transactions(start, end, 'expense'))

    # ── 1. Spending Discipline (0-20) ─────────────────────────────
    def calculate_spending_discipline(self, month_date):
        """
        Sub-scores:
          - Budget adherence (0-14): expense / income ratio — PRIMARY driver
          - Spending consistency (0-3): low std-dev across expense txns
          - Category diversity (0-3): spending spread across categories
        """
        try:
            start, end = self._month_range(month_date)
            income = self._total_income(start, end)
            expenses = self._total_expenses(start, end)
            expense_txns = list(self._get_transactions(start, end, 'expense'))
            tx_count = len(expense_txns)

            # --- budget adherence (0-14) — expense/income ratio is king ---
            if income > 0:
                spend_ratio = expenses / income
                if spend_ratio <= 0.40:
                    budget_score = 14
                elif spend_ratio <= 0.50:
                    budget_score = 12
                elif spend_ratio <= 0.60:
                    budget_score = 10
                elif spend_ratio <= 0.70:
                    budget_score = 8
                elif spend_ratio <= 0.80:
                    budget_score = 5
                elif spend_ratio <= 0.90:
                    budget_score = 3
                elif spend_ratio <= 1.0:
                    budget_score = 1
                else:
                    budget_score = 0  # spending more than income
            else:
                budget_score = 4  # neutral – no income data

            # --- spending consistency (0-3) ---
            if tx_count >= 3:
                amounts = [float(t.amount or 0) for t in expense_txns]
                avg_amt = sum(amounts) / len(amounts) if amounts else 1
                variance = sum((a - avg_amt) ** 2 for a in amounts) / len(amounts)
                stddev = variance ** 0.5
                cv = stddev / avg_amt if avg_amt > 0 else 1
                if cv <= 0.3:
                    consistency_score = 3
                elif cv <= 0.6:
                    consistency_score = 2
                elif cv <= 1.0:
                    consistency_score = 1
                else:
                    consistency_score = 0
            else:
                consistency_score = 1  # too few txns

            # --- category diversity (0-3) ---
            cat_totals = {}
            for t in expense_txns:
                cat_totals[t.category] = cat_totals.get(t.category, 0) + float(t.amount or 0)
            num_cats = len(cat_totals)
            if num_cats >= 5:
                diversity_score = 3
            elif num_cats >= 3:
                diversity_score = 2
            elif num_cats >= 1:
                diversity_score = 1
            else:
                diversity_score = 0

            total = max(0, min(20, budget_score + consistency_score + diversity_score))
            metrics = {
                'income': round(income, 2),
                'expenses': round(expenses, 2),
                'spend_ratio': round(expenses / income, 3) if income else 0,
                'tx_count': tx_count,
                'budget_score': budget_score,
                'consistency_score': consistency_score,
                'diversity_score': diversity_score,
            }
            expl = (f"Spending Discipline: {total}/20 — "
                    f"Spend ratio {metrics['spend_ratio']:.0%}, "
                    f"{tx_count} transactions across {num_cats} categories.")
            return total, metrics, expl
        except Exception as e:
            return 10, {}, f"Error: {e}"

    # ── 2. Savings Ratio (0-20) ───────────────────────────────────
    def calculate_savings_ratio(self, month_date):
        """
        Sub-scores:
          - Savings rate (0-14): (income - expenses) / income — heavily expense-driven
          - Emergency fund adequacy (0-6): savings / monthly_expenses >= 3 months
        """
        try:
            start, end = self._month_range(month_date)
            income = self._total_income(start, end)
            expenses = self._total_expenses(start, end)
            savings = income - expenses

            # --- savings rate (0-14) ---
            if income > 0:
                rate = savings / income
                if rate >= 0.30:
                    savings_score = 14
                elif rate >= 0.20:
                    savings_score = 12
                elif rate >= 0.10:
                    savings_score = 9
                elif rate >= 0.05:
                    savings_score = 6
                elif rate >= 0.0:
                    savings_score = 3
                else:
                    savings_score = 0  # negative savings (overspending)
            else:
                savings_score = 0

            # --- emergency fund (0-6) ---
            # Use wallet balance as proxy for liquid emergency fund
            wallet = Wallet.objects.filter(user=self.user).first()
            balance = float(wallet.balance) if wallet else 0
            monthly_exp = expenses if expenses > 0 else 1
            months_covered = balance / monthly_exp

            if months_covered >= 6:
                emerg_score = 6
            elif months_covered >= 3:
                emerg_score = 4
            elif months_covered >= 1:
                emerg_score = 2
            else:
                emerg_score = 0

            total = max(0, min(20, savings_score + emerg_score))
            metrics = {
                'income': round(income, 2),
                'expenses': round(expenses, 2),
                'savings': round(savings, 2),
                'savings_rate': round(savings / income, 3) if income else 0,
                'wallet_balance': balance,
                'months_covered': round(months_covered, 1),
            }
            expl = (f"Savings Ratio: {total}/20 — "
                    f"Rate {metrics['savings_rate']:.0%}, "
                    f"Emergency fund covers {months_covered:.1f} months.")
            return total, metrics, expl
        except Exception as e:
            return 10, {}, f"Error: {e}"

    # ── 3. Credit Utilization / Discipline (0-20) ─────────────────
    def calculate_credit_utilization(self, month_date):
        """Based on missed EMIs from active loans."""
        try:
            loans = Loan.objects.filter(user=self.user, status='ACTIVE')
            total_missed = loans.aggregate(total=Sum('missed_emis'))['total'] or 0
            score = max(0, 20 - total_missed * 5)
            metrics = {'missed_emis': total_missed, 'active_loans': loans.count()}
            if total_missed > 0:
                expl = f"Credit Discipline: {score}/20 — {total_missed} missed payments."
            else:
                expl = f"Credit Discipline: {score}/20 — No missed payments."
            return score, metrics, expl
        except Exception as e:
            return 15, {}, f"Error: {e}"

    # ── 4. Loan Burden / DTI (0-20) ───────────────────────────────
    def calculate_loan_burden(self, month_date):
        """Debt-to-Income ratio from active loans vs real income."""
        try:
            loans = Loan.objects.filter(user=self.user, status='ACTIVE')
            total_emi = sum(float(l.monthly_emi or 0) for l in loans)

            # Use 3-month average income from transactions, fallback to profile income
            end_aware = self._to_aware_datetime(month_date)
            start_3m = end_aware - timedelta(days=90)
            tx_income_3m = sum(
                float(t.amount or 0)
                for t in Transaction.objects.filter(
                    user=self.user, type='income',
                    date__gte=start_3m, date__lt=end_aware
                )
            )
            profile_income = self._get_profile_income()
            avg_monthly = max(tx_income_3m / 3, profile_income) if tx_income_3m > 0 else profile_income
            if avg_monthly < 1:
                avg_monthly = 1.0

            dti = total_emi / avg_monthly

            if total_emi == 0:
                score, note = 20, 'Debt-free'
            elif dti <= 0.20:
                score, note = 18, 'Excellent DTI (≤20%)'
            elif dti <= 0.30:
                score, note = 15, 'Healthy DTI (20-30%)'
            elif dti <= 0.40:
                score, note = 11, 'Moderate DTI (30-40%)'
            elif dti <= 0.50:
                score, note = 7, 'High DTI (40-50%)'
            else:
                score, note = 3, 'Critical DTI (>50%)'

            metrics = {
                'total_emi': total_emi,
                'avg_monthly_income': round(avg_monthly, 2),
                'dti_pct': round(dti * 100, 1),
                'active_loans': loans.count(),
                'note': note,
            }
            expl = f"Loan Burden: {score}/20 — DTI {metrics['dti_pct']}%. {note}."
            return score, metrics, expl
        except Exception as e:
            return 15, {}, f"Error: {e}"

    # ── 5. Risk Exposure (0-20) ───────────────────────────────────
    def calculate_risk_exposure(self, month_date):
        """
        Sub-scores:
          - Emergency fund size (0-10): liquid reserves vs expenses
          - Income stability (0-10): income variance last 3 months
        """
        try:
            start, end = self._month_range(month_date)
            expenses = self._total_expenses(start, end)

            # --- emergency fund (0-10) ---
            wallet = Wallet.objects.filter(user=self.user).first()
            balance = float(wallet.balance) if wallet else 0
            monthly_exp = expenses if expenses > 0 else 1
            months_reserve = balance / monthly_exp

            if months_reserve >= 6:
                emerg = 10
            elif months_reserve >= 3:
                emerg = 7
            elif months_reserve >= 1:
                emerg = 4
            else:
                emerg = 1

            # --- income stability (0-10) ---
            # Check income variance over last 3 months
            monthly_incomes = []
            # Convert month_date to a plain date for arithmetic
            base_date = month_date.date() if isinstance(month_date, datetime) else month_date
            for i in range(3):
                m_start_date = (base_date - timedelta(days=30 * (i + 1))).replace(day=1)
                if m_start_date.month == 12:
                    m_end_date = m_start_date.replace(year=m_start_date.year + 1, month=1, day=1)
                else:
                    m_end_date = m_start_date.replace(month=m_start_date.month + 1, day=1)
                m_start_aware = self._to_aware_datetime(m_start_date)
                m_end_aware = self._to_aware_datetime(m_end_date)
                mi = sum(
                    float(t.amount or 0)
                    for t in Transaction.objects.filter(
                        user=self.user, type='income',
                        date__gte=m_start_aware, date__lt=m_end_aware
                    )
                )
                if mi == 0:
                    mi = self._get_profile_income()
                monthly_incomes.append(mi)

            avg_inc = sum(monthly_incomes) / 3 if monthly_incomes else 1
            if avg_inc > 0:
                variance = sum(abs(m - avg_inc) for m in monthly_incomes) / (3 * avg_inc)
                if variance <= 0.05:
                    stability = 10
                elif variance <= 0.15:
                    stability = 7
                elif variance <= 0.30:
                    stability = 4
                else:
                    stability = 2
            else:
                stability = 5

            total = max(0, min(20, emerg + stability))
            metrics = {
                'wallet_balance': balance,
                'months_reserve': round(months_reserve, 1),
                'monthly_incomes': [round(m, 2) for m in monthly_incomes],
                'income_variance': round(variance, 3) if avg_inc > 0 else 0,
            }
            expl = (f"Risk Exposure: {total}/20 — "
                    f"Reserve {months_reserve:.1f} months, "
                    f"income stability {stability}/10.")
            return total, metrics, expl
        except Exception as e:
            return 10, {}, f"Error: {e}"

    # ── Total Score ───────────────────────────────────────────────
    def calculate_total_score(self, month_date):
        """
        Aggregate all 5 factors into a 0-100 score with expense-income dominance.

        The final score blends:
          60% — pure expense-to-income ratio (high expenses → low score)
          40% — detailed factor analysis (spending, savings, credit, loans, safety)

        This ensures the score directly reflects how much the user spends
        relative to their income.
        """
        spending_score, spending_m, spending_e = self.calculate_spending_discipline(month_date)
        savings_score, savings_m, savings_e = self.calculate_savings_ratio(month_date)
        credit_score, credit_m, credit_e = self.calculate_credit_utilization(month_date)
        loan_score, loan_m, loan_e = self.calculate_loan_burden(month_date)
        risk_score, risk_m, risk_e = self.calculate_risk_exposure(month_date)

        factor_total = spending_score + savings_score + credit_score + loan_score + risk_score

        # ── Expense-Income Dominance Score ──
        # The CORE signal: how much you spend vs how much you earn.
        start, end = self._month_range(month_date)
        income = self._total_income(start, end)
        expenses = self._total_expenses(start, end)

        if income > 0:
            expense_ratio = expenses / income
        else:
            expense_ratio = 0

        # ── Final score computation ──
        # When expenses EXCEED income  → score drops harshly (hard cap 15)
        # When expenses EQUAL income   → score around 20-25
        # When expenses are moderate   → score 50-70 range
        # When income >> expenses      → score 75-100 (excellent)
        if income > 0:
            if expense_ratio > 1.0:
                # OVERSPENDING: score crashes. The more you overspend, the worse.
                # At 100% → 15, at 200% → 5, at 300%+ → 0
                overspend_penalty = min(15, int((expense_ratio - 1.0) * 15))
                total = max(0, 15 - overspend_penalty)
            elif expense_ratio > 0.90:
                # DANGER ZONE: 90-100% of income spent
                total = max(0, min(30, int(30 - (expense_ratio - 0.90) * 100)))
            elif expense_ratio > 0.70:
                # HIGH: 70-90% of income spent → score 30-55
                total = int(55 - (expense_ratio - 0.70) * 125)
                # Blend in some factor score for nuance
                total = max(30, min(55, int(total * 0.7 + (factor_total / 100) * 55 * 0.3)))
            elif expense_ratio > 0.50:
                # MODERATE: 50-70% → score 55-75
                base = int(75 - (expense_ratio - 0.50) * 100)
                total = max(55, min(75, int(base * 0.6 + (factor_total / 100) * 75 * 0.4)))
            elif expense_ratio > 0.30:
                # GOOD: 30-50% → score 75-90
                base = int(90 - (expense_ratio - 0.30) * 75)
                total = max(75, min(90, int(base * 0.6 + (factor_total / 100) * 90 * 0.4)))
            else:
                # EXCELLENT: <30% of income spent → score 90-100
                base = int(100 - expense_ratio * 33)
                total = max(90, min(100, int(base * 0.5 + (factor_total / 100) * 100 * 0.5)))
        else:
            # No income data — use factor score alone, conservative
            total = max(0, min(40, int(factor_total * 0.4)))

        # Determine human-readable expense level
        if income > 0:
            if expense_ratio <= 0.30:
                expense_level = 'Very Low'
            elif expense_ratio <= 0.50:
                expense_level = 'Low'
            elif expense_ratio <= 0.70:
                expense_level = 'Moderate'
            elif expense_ratio <= 0.85:
                expense_level = 'High'
            elif expense_ratio <= 1.0:
                expense_level = 'Very High'
            else:
                expense_level = 'Critical (exceeds income)'
        else:
            expense_level = 'Unknown (no income data)'

        explanation = (
            f"Financial Health Score: {total}/100\n\n"
            f"Income: {income:,.0f} | Expenses: {expenses:,.0f} | "
            f"Expense Ratio: {expense_ratio:.0%} ({expense_level})\n\n"
            f"How Your Score Works:\n"
            f"- Expenses {'EXCEED' if expense_ratio > 1 else 'are ' + f'{expense_ratio:.0%} of'} your income → Score {total}/100\n"
            f"- Lower expenses relative to income = higher score\n\n"
            f"Factor Breakdown:\n"
            f"- Spending Discipline: {spending_score}/20\n"
            f"- Savings Health: {savings_score}/20\n"
            f"- Credit Discipline: {credit_score}/20\n"
            f"- Loan Burden: {loan_score}/20\n"
            f"- Financial Safety: {risk_score}/20\n\n"
            f"{spending_e}\n{savings_e}\n{credit_e}\n{loan_e}\n{risk_e}"
        )

        # ── Generate recommendations based on expense level and factors ──
        recommendations = []

        # Expense-driven recommendations (highest priority)
        if expense_ratio > 1.0:
            recommendations.append({
                'title': 'Spending Exceeds Income',
                'description': f'You are spending {expense_ratio:.0%} of your income. Cut non-essential expenses immediately to avoid debt.',
                'priority': 'critical',
            })
        elif expense_ratio > 0.85:
            recommendations.append({
                'title': 'Reduce High Expenses',
                'description': f'Your expenses consume {expense_ratio:.0%} of income. Target under 70% by trimming discretionary spending.',
                'priority': 'high',
            })
        elif expense_ratio > 0.70:
            recommendations.append({
                'title': 'Optimize Spending',
                'description': f'Expenses are {expense_ratio:.0%} of income. Aim for 50-60% to build stronger savings.',
                'priority': 'medium',
            })
        elif expense_ratio <= 0.50 and income > 0:
            recommendations.append({
                'title': 'Great Expense Control',
                'description': f'Spending only {expense_ratio:.0%} of income — excellent! Consider investing the surplus.',
                'priority': 'low',
            })

        # Factor-based recommendations
        if spending_score < 12:
            recommendations.append({
                'title': 'Improve Spending Discipline',
                'description': 'Keep expenses below 70% of income and diversify spending across categories.',
                'priority': 'high',
            })
        if savings_score < 12:
            recommendations.append({
                'title': 'Increase Savings Rate',
                'description': 'Aim to save at least 20% of your monthly income.',
                'priority': 'high',
            })
        if credit_score < 18:
            recommendations.append({
                'title': 'Improve Credit Discipline',
                'description': 'Avoid missing EMI payments to maintain a strong credit profile.',
                'priority': 'medium',
            })
        if loan_score < 14:
            recommendations.append({
                'title': 'Reduce Debt Burden',
                'description': 'Work toward a DTI ratio below 30% by accelerating repayments.',
                'priority': 'high',
            })
        if risk_score < 14:
            recommendations.append({
                'title': 'Build Emergency Reserves',
                'description': 'Save 3-6 months of expenses in a liquid account.',
                'priority': 'medium',
            })

        health_score, _ = FinancialHealthScore.objects.update_or_create(
            user=self.user,
            month=month_date,
            defaults={
                'score': total,
                'spending_discipline_score': spending_score,
                'savings_ratio_score': savings_score,
                'credit_utilization_score': credit_score,
                'loan_burden_score': loan_score,
                'risk_exposure_score': risk_score,
                'explanation': explanation,
                'recommendations': recommendations,
            },
        )

        factors = [
            ('spending_discipline', spending_score, spending_m, spending_e),
            ('savings_ratio', savings_score, savings_m, savings_e),
            ('credit_utilization', credit_score, credit_m, credit_e),
            ('loan_burden', loan_score, loan_m, loan_e),
            ('risk_exposure', risk_score, risk_m, risk_e),
        ]
        for name, sc, met, exp in factors:
            ScoreFactorDetail.objects.update_or_create(
                health_score=health_score,
                factor_name=name,
                defaults={'score': sc, 'weight': 0.2, 'metrics': met, 'explanation': exp},
            )

        return health_score
