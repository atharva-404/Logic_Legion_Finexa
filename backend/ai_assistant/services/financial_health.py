# ai_assistant/services/financial_health.py
"""
Financial Health Score Calculator
Calculates 0-100 financial health score based on 5 factors
"""
from decimal import Decimal
from datetime import datetime, timedelta
from django.db.models import Sum, Avg, Count
from django.utils import timezone
from ..models import WalletTransaction, Wallet, FinancialHealthScore, ScoreFactorDetail, Loan


class FinancialHealthCalculator:
    """
    Calculates financial health scores based on user's financial data
    """
    
    def __init__(self, user):
        self.user = user
        
    def calculate_spending_discipline(self, month_date):
        """
        Calculate spending discipline score (0-20 points)
        
        Factors:
        - Consistency in spending (8 points)
        - Ratio of planned vs impulse purchases (6 points)
        - Budget adherence (6 points)
        
        Returns: (score, metrics, explanation)
        """
        try:
            # Get transactions for the month
            start_date = month_date.replace(day=1)
            if month_date.month == 12:
                end_date = month_date.replace(year=month_date.year + 1, month=1, day=1)
            else:
                end_date = month_date.replace(month=month_date.month + 1, day=1)
            
            wallet = Wallet.objects.filter(user=self.user).first()
            if not wallet:
                return 10, {}, "No wallet data available. Default score assigned."
            
            transactions = WalletTransaction.objects.filter(
                wallet=wallet,
                timestamp__gte=start_date,
                timestamp__lt=end_date,
                transaction_type='WITHDRAW'
            )
            
            total_withdrawals = transactions.aggregate(total=Sum('amount'))['total'] or Decimal('0')
            transaction_count = transactions.count()
            
            # Calculate consistency score (0-8)
            # Lower variance = better consistency
            if transaction_count > 0:
                avg_transaction = total_withdrawals / transaction_count
                consistency_score = min(8, int(8 * (1 - min(1, float(avg_transaction) / 1000))))
            else:
                consistency_score = 8  # No spending = perfect consistency
            
            # Calculate impulse purchase ratio (0-6)
            # For now, assume smaller transactions are more impulsive
            small_transactions = transactions.filter(amount__lt=100).count()
            impulse_ratio = small_transactions / max(transaction_count, 1)
            impulse_score = int(6 * (1 - impulse_ratio))
            
            # Budget adherence (0-6)
            # Simple heuristic: lower total spending = better adherence
            budget_score = min(6, int(6 * (1 - min(1, float(total_withdrawals) / 10000))))
            
            total_score = max(0, min(20, consistency_score + impulse_score + budget_score))
            
            metrics = {
                'total_withdrawals': float(total_withdrawals),
                'transaction_count': transaction_count,
                'avg_transaction': float(avg_transaction) if transaction_count > 0 else 0,
                'consistency_score': consistency_score,
                'impulse_score': impulse_score,
                'budget_score': budget_score
            }
            
            explanation = f"Spending discipline: {total_score}/20. " \
                         f"Based on {transaction_count} transactions totaling ₹{total_withdrawals}."
            
            return total_score, metrics, explanation
            
        except Exception as e:
            return 10, {}, f"Error calculating spending discipline: {str(e)}"
    
    def calculate_savings_ratio(self, month_date):
        """
        Calculate savings ratio score (0-20 points)
        
        Factors:
        - Savings rate (12 points) - target: 20%+
        - Emergency fund adequacy (8 points)
        
        Returns: (score, metrics, explanation)
        """
        try:
            wallet = Wallet.objects.filter(user=self.user).first()
            if not wallet:
                return 10, {}, "No wallet data available."
            
            # Get income (deposits) and expenses (withdrawals) for the month
            start_date = month_date.replace(day=1)
            if month_date.month == 12:
                end_date = month_date.replace(year=month_date.year + 1, month=1, day=1)
            else:
                end_date = month_date.replace(month=month_date.month + 1, day=1)
            
            income = WalletTransaction.objects.filter(
                wallet=wallet,
                timestamp__gte=start_date,
                timestamp__lt=end_date,
                transaction_type='ADD'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            
            expenses = WalletTransaction.objects.filter(
                wallet=wallet,
                timestamp__gte=start_date,
                timestamp__lt=end_date,
                transaction_type='WITHDRAW'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            
            # Calculate savings rate
            if income > 0:
                savings = income - expenses
                savings_rate = float(savings / income)
                # Target: 20% savings rate = 12 points
                savings_score = max(0, min(12, int(12 * (savings_rate / 0.20))))
            else:
                savings_rate = 0
                savings_score = 0
            
            # Emergency fund adequacy (0-8)
            # Current balance as months of expenses
            monthly_expenses = float(expenses) if expenses > 0 else 1
            months_covered = float(wallet.balance) / monthly_expenses if monthly_expenses > 0 else 0
            # Target: 3+ months = 8 points
            emergency_score = min(8, int(8 * (months_covered / 3)))
            
            total_score = max(0, min(20, savings_score + emergency_score))
            
            metrics = {
                'income': float(income),
                'expenses': float(expenses),
                'savings': float(income - expenses),
                'savings_rate': savings_rate,
                'current_balance': float(wallet.balance),
                'months_covered': months_covered,
                'savings_score': savings_score,
                'emergency_score': emergency_score
            }
            
            explanation = f"Savings ratio: {total_score}/20. " \
                         f"Savings rate: {savings_rate*100:.1f}%, Emergency fund: {months_covered:.1f} months."
            
            return total_score, metrics, explanation
            
        except Exception as e:
            return 10, {}, f"Error calculating savings ratio: {str(e)}"
    
    def calculate_credit_utilization(self, month_date):
        """
        Calculate credit behavior score (0-20 points)
        Uses 'Missed EMIs' and 'Wallet Overdrafts' as proxy for credit discipline.
        """
        try:
            # 1. Check Missed EMIs
            loans = Loan.objects.filter(user=self.user, status='ACTIVE')
            total_missed = loans.aggregate(total=Sum('missed_emis'))['total'] or 0
            
            # 2. Score Calculation
            # Start with perfect score
            score = 20
            
            # Deduct 5 points per missed EMI
            penalty = total_missed * 5
            score = max(0, score - penalty)
            
            metrics = {
                'missed_emis': total_missed,
                'penalty_applied': penalty,
                'base_score': 20
            }
            
            if total_missed > 0:
                explanation = f"Credit Discipline: {score}/20. Penalty applied for {total_missed} missed loan payments."
            else:
                explanation = "Credit Discipline: 20/20. No missed payments detected."
                
            return score, metrics, explanation
            
        except Exception as e:
             return 15, {}, "Default score due to error."
    
    def calculate_loan_burden(self, month_date):
        """
        Calculate loan burden score (0-20 points)
        Based on Debt-to-Income (DTI) ratio from active loans.
        """
        try:
            # 1. Calculate Total Monthly EMI
            loans = Loan.objects.filter(user=self.user, status='ACTIVE')
            total_emi = loans.aggregate(total=Sum('monthly_emi'))['total'] or Decimal('0')
            total_emi = float(total_emi)

            # 2. Calculate Monthly Income (Avg of last 3 months to be stable)
            end_date = month_date
            start_date = end_date - timedelta(days=90)
            
            wallet = Wallet.objects.filter(user=self.user).first()
            if not wallet:
                return 15, {}, "No wallet data for income verification."

            total_income_3mo = WalletTransaction.objects.filter(
                wallet=wallet,
                timestamp__gte=start_date,
                timestamp__lt=end_date,
                transaction_type='ADD'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            
            avg_monthly_income = float(total_income_3mo) / 3
            if avg_monthly_income < 1: avg_monthly_income = 1.0 # Avoid div/0

            # 3. Calculate DTI
            dti_ratio = total_emi / avg_monthly_income
            
            # 4. Scoring Logic
            if total_emi == 0:
                score = 20 # No debt is excellent
                note = "Debt-free"
            elif dti_ratio <= 0.30:
                score = 18
                note = "Healthy DTI (<30%)"
            elif dti_ratio <= 0.40:
                score = 15
                note = "Moderate DTI (30-40%)"
            elif dti_ratio <= 0.50:
                score = 10
                note = "High DTI (40-50%)"
            else:
                score = 5
                note = "Critical DTI (>50%)"

            metrics = {
                'total_debt_emi': total_emi,
                'est_monthly_income': round(avg_monthly_income, 2),
                'debt_to_income_ratio': round(dti_ratio * 100, 1),
                'active_loans': loans.count(),
                'note': note
            }
            explanation = f"Loan Burden: {score}/20. DTI Ratio: {metrics['debt_to_income_ratio']}%. {note}"
            
            return score, metrics, explanation
        except Exception as e:
            return 15, {}, f"Error calculating loan burden: {str(e)}"
    
    def calculate_risk_exposure(self, month_date):
        """
        Calculate risk exposure score (0-20 points)
        
        Factors:
        - Emergency fund size (10 points)
        - Financial stability (10 points)
        
        Returns: (score, metrics, explanation)
        """
        try:
            wallet = Wallet.objects.filter(user=self.user).first()
            if not wallet:
                return 10, {}, "No wallet data available."
            
            # Emergency fund score (0-10)
            # Based on current balance
            balance = float(wallet.balance)
            # Target: ₹50,000+ = 10 points
            emergency_score = min(10, int(10 * (balance / 50000)))
            
            # Stability score (0-10)
            # Based on balance trend over last 3 months
            three_months_ago = month_date - timedelta(days=90)
            old_transactions = WalletTransaction.objects.filter(
                wallet=wallet,
                timestamp__gte=three_months_ago,
                timestamp__lt=month_date
            )
            
            if old_transactions.exists():
                # Positive trend = higher score
                stability_score = min(10, max(0, int(10 * (balance / 10000))))
            else:
                stability_score = 5  # Neutral if no history
            
            total_score = emergency_score + stability_score
            
            metrics = {
                'current_balance': balance,
                'emergency_score': emergency_score,
                'stability_score': stability_score
            }
            
            explanation = f"Risk exposure: {total_score}/20. " \
                         f"Emergency fund: ₹{balance:.2f}, Stability: {stability_score}/10."
            
            return total_score, metrics, explanation
            
        except Exception as e:
            return 10, {}, f"Error calculating risk exposure: {str(e)}"
    
    def calculate_total_score(self, month_date):
        """
        Calculate total financial health score (0-100)
        
        Aggregates all 5 factor scores
        
        Returns: FinancialHealthScore object
        """
        # Calculate all factors
        spending_score, spending_metrics, spending_explanation = self.calculate_spending_discipline(month_date)
        savings_score, savings_metrics, savings_explanation = self.calculate_savings_ratio(month_date)
        credit_score, credit_metrics, credit_explanation = self.calculate_credit_utilization(month_date)
        loan_score, loan_metrics, loan_explanation = self.calculate_loan_burden(month_date)
        risk_score, risk_metrics, risk_explanation = self.calculate_risk_exposure(month_date)
        
        # Calculate total score (clamped to 0-100)
        total_score = spending_score + savings_score + credit_score + loan_score + risk_score
        total_score = max(0, min(100, total_score))
        
        # Generate overall explanation
        explanation = f"""Financial Health Score: {total_score}/100

Breakdown:
- Spending Discipline: {spending_score}/20
- Savings Ratio: {savings_score}/20
- Credit Utilization: {credit_score}/20
- Loan Burden: {loan_score}/20
- Risk Exposure: {risk_score}/20

{spending_explanation}
{savings_explanation}
{credit_explanation}
{loan_explanation}
{risk_explanation}
"""
        
        # Generate recommendations
        recommendations = []
        
        if spending_score < 15:
            recommendations.append({
                'title': 'Improve Spending Discipline',
                'description': 'Track your expenses and create a monthly budget',
                'priority': 'high'
            })
        
        if savings_score < 15:
            recommendations.append({
                'title': 'Increase Savings Rate',
                'description': 'Aim to save at least 20% of your income',
                'priority': 'high'
            })
        
        if risk_score < 15:
            recommendations.append({
                'title': 'Build Emergency Fund',
                'description': 'Save at least 3-6 months of expenses',
                'priority': 'medium'
            })
        
        # Create or update score record
        health_score, created = FinancialHealthScore.objects.update_or_create(
            user=self.user,
            month=month_date,
            defaults={
                'score': total_score,
                'spending_discipline_score': spending_score,
                'savings_ratio_score': savings_score,
                'credit_utilization_score': credit_score,
                'loan_burden_score': loan_score,
                'risk_exposure_score': risk_score,
                'explanation': explanation,
                'recommendations': recommendations
            }
        )
        
        # Create factor details
        factors = [
            ('spending_discipline', spending_score, spending_metrics, spending_explanation),
            ('savings_ratio', savings_score, savings_metrics, savings_explanation),
            ('credit_utilization', credit_score, credit_metrics, credit_explanation),
            ('loan_burden', loan_score, loan_metrics, loan_explanation),
            ('risk_exposure', risk_score, risk_metrics, risk_explanation),
        ]
        
        for factor_name, score, metrics, expl in factors:
            ScoreFactorDetail.objects.update_or_create(
                health_score=health_score,
                factor_name=factor_name,
                defaults={
                    'score': score,
                    'weight': 0.2,
                    'metrics': metrics,
                    'explanation': expl
                }
            )
        
        return health_score
