# ai_assistant/financial_health_views.py
"""
Financial Health Score API Views
Provides endpoints for retrieving and calculating financial health scores
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import FinancialHealthScore, ScoreFactorDetail
from .services.financial_health import FinancialHealthCalculator


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_score(request):
    """
    Get the user's current financial health score
    Returns the most recent score or calculates a new one if none exists
    """
    try:
        # Always recalculate to reflect latest income/expense reality
        calculator = FinancialHealthCalculator(request.user)
        current_month = timezone.now().date().replace(day=1)
        latest_score = calculator.calculate_total_score(current_month)

        # Compute current month income/expenses for the response
        from transactions.models import Transaction
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_txns = Transaction.objects.filter(user=request.user, date__gte=month_start)
        monthly_income = sum(float(t.amount or 0) for t in month_txns.filter(type='income'))
        monthly_expense = sum(float(t.amount or 0) for t in month_txns.filter(type='expense'))
        profile_income = float(request.user.income or 0)
        effective_income = max(monthly_income, profile_income)
        expense_ratio = round(monthly_expense / effective_income, 3) if effective_income > 0 else 0

        return Response({
            'score': latest_score.score,
            'category': latest_score.get_score_category(),
            'color': latest_score.get_score_color(),
            'month': latest_score.month,
            'calculation_date': latest_score.calculation_date,
            'income': round(effective_income, 2),
            'expenses': round(monthly_expense, 2),
            'expense_ratio': expense_ratio,
            'factors': {
                'spending_discipline': latest_score.spending_discipline_score,
                'savings_ratio': latest_score.savings_ratio_score,
                'credit_utilization': latest_score.credit_utilization_score,
                'loan_burden': latest_score.loan_burden_score,
                'risk_exposure': latest_score.risk_exposure_score,
            },
            'explanation': latest_score.explanation,
            'recommendations': latest_score.recommendations,
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get score: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_score_history(request):
    """
    Get the user's financial health score history
    Returns scores for the last 12 months
    """
    try:
        # Get number of months from query params (default: 12)
        months = int(request.query_params.get('months', 12))
        months = min(months, 24)  # Cap at 24 months
        
        # Get scores for the last N months
        scores = FinancialHealthScore.objects.filter(
            user=request.user
        ).order_by('-month')[:months]
        
        history = [{
            'month': score.month,
            'score': score.score,
            'category': score.get_score_category(),
            'color': score.get_score_color(),
            'calculation_date': score.calculation_date,
            'factors': {
                'spending_discipline': score.spending_discipline_score,
                'savings_ratio': score.savings_ratio_score,
                'credit_utilization': score.credit_utilization_score,
                'loan_burden': score.loan_burden_score,
                'risk_exposure': score.risk_exposure_score,
            }
        } for score in reversed(scores)]
        
        # Calculate trend
        if len(history) >= 2:
            latest = history[-1]['score']
            previous = history[-2]['score']
            change = latest - previous
            trend = 'up' if change > 0 else 'down' if change < 0 else 'stable'
        else:
            change = 0
            trend = 'stable'
        
        return Response({
            'history': history,
            'trend': trend,
            'change': change,
            'total_months': len(history)
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get history: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_score_breakdown(request):
    """
    Get detailed breakdown of the current score
    Returns factor details with metrics and explanations
    """
    try:
        # Get the most recent score
        latest_score = FinancialHealthScore.objects.filter(
            user=request.user
        ).order_by('-calculation_date').first()
        
        if not latest_score:
            return Response(
                {'error': 'No score found. Please calculate your score first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get factor details
        factor_details = ScoreFactorDetail.objects.filter(
            health_score=latest_score
        )
        
        breakdown = {
            'overall_score': latest_score.score,
            'category': latest_score.get_score_category(),
            'color': latest_score.get_score_color(),
            'month': latest_score.month,
            'factors': []
        }
        
        for detail in factor_details:
            breakdown['factors'].append({
                'name': detail.factor_name,
                'display_name': detail.get_factor_name_display(),
                'score': detail.score,
                'max_score': 20,
                'weight': detail.weight,
                'percentage': (detail.score / 20) * 100,
                'metrics': detail.metrics,
                'explanation': detail.explanation
            })
        
        return Response(breakdown)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get breakdown: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recalculate_score(request):
    """
    Force recalculation of the financial health score
    Optionally for a specific month
    """
    try:
        # Get month from request (default: current month)
        month_str = request.data.get('month')
        if month_str:
            month_date = datetime.strptime(month_str, '%Y-%m-%d').date()
        else:
            month_date = timezone.now().date().replace(day=1)
        
        # Calculate score
        calculator = FinancialHealthCalculator(request.user)
        health_score = calculator.calculate_total_score(month_date)
        
        return Response({
            'success': True,
            'message': 'Score recalculated successfully',
            'score': health_score.score,
            'category': health_score.get_score_category(),
            'color': health_score.get_score_color(),
            'month': health_score.month,
            'calculation_date': health_score.calculation_date,
            'factors': {
                'spending_discipline': health_score.spending_discipline_score,
                'savings_ratio': health_score.savings_ratio_score,
                'credit_utilization': health_score.credit_utilization_score,
                'loan_burden': health_score.loan_burden_score,
                'risk_exposure': health_score.risk_exposure_score,
            },
            'recommendations': health_score.recommendations,
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to recalculate score: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    """
    Get personalized recommendations based on the current score
    """
    try:
        latest_score = FinancialHealthScore.objects.filter(
            user=request.user
        ).order_by('-calculation_date').first()
        
        if not latest_score:
            return Response(
                {'error': 'No score found. Please calculate your score first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'score': latest_score.score,
            'category': latest_score.get_score_category(),
            'recommendations': latest_score.recommendations
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get recommendations: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
