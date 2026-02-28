# ai_assistant/wallet_views.py
"""
Wallet API Views
Handles all wallet-related operations: balance, add money, withdraw, transactions
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db import transaction as db_transaction
from django.utils import timezone
from decimal import Decimal
from .models import Wallet, WalletTransaction


class TransactionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet(request):
    """
    Get or create user's wallet details
    """
    wallet, created = Wallet.objects.get_or_create(
        user=request.user,
        defaults={'balance': Decimal('0.00'), 'currency': 'INR'}
    )
    
    return Response({
        'id': wallet.id,
        'balance': str(wallet.balance),
        'currency': wallet.currency,
        'is_active': wallet.is_active,
        'created_at': wallet.created_at,
        'updated_at': wallet.updated_at,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_money(request):
    """
    Add money to user's wallet
    """
    amount = request.data.get('amount')
    description = request.data.get('description', 'Money added to wallet')
    
    # Validation
    if not amount:
        return Response(
            {'error': 'Amount is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        amount = Decimal(str(amount))
        if amount <= 0:
            return Response(
                {'error': 'Amount must be greater than zero'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid amount format'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get or create wallet
    wallet, created = Wallet.objects.get_or_create(
        user=request.user,
        defaults={'balance': Decimal('0.00'), 'currency': 'INR'}
    )
    
    # Atomic transaction to prevent race conditions
    with db_transaction.atomic():
        # Lock the wallet row
        wallet = Wallet.objects.select_for_update().get(id=wallet.id)
        
        # Update balance
        wallet.balance += amount
        wallet.save()
        
        # Create transaction record
        txn = WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='ADD',
            amount=amount,
            description=description,
            status='COMPLETED'
        )
    
    # Send notification
    try:
        from users.notifications import notify_wallet_deposit
        notify_wallet_deposit(request.user, float(amount))
    except Exception:
        pass

    return Response({
        'success': True,
        'message': f'Successfully added {amount} {wallet.currency}',
        'wallet': {
            'balance': str(wallet.balance),
            'currency': wallet.currency,
        },
        'transaction': {
            'id': txn.id,
            'reference_id': txn.reference_id,
            'amount': str(txn.amount),
            'type': txn.transaction_type,
            'timestamp': txn.timestamp,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw_money(request):
    """
    Withdraw money from user's wallet
    """
    amount = request.data.get('amount')
    description = request.data.get('description', 'Money withdrawn from wallet')
    
    # Validation
    if not amount:
        return Response(
            {'error': 'Amount is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        amount = Decimal(str(amount))
        if amount <= 0:
            return Response(
                {'error': 'Amount must be greater than zero'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid amount format'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get wallet
    try:
        wallet = Wallet.objects.get(user=request.user)
    except Wallet.DoesNotExist:
        return Response(
            {'error': 'Wallet not found. Please add money first.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check sufficient balance
    if not wallet.can_withdraw(amount):
        return Response(
            {'error': f'Insufficient balance. Available: {wallet.balance} {wallet.currency}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Atomic transaction
    with db_transaction.atomic():
        # Lock the wallet row
        wallet = Wallet.objects.select_for_update().get(id=wallet.id)
        
        # Update balance
        wallet.balance -= amount
        wallet.save()
        
        # Create transaction record
        txn = WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='WITHDRAW',
            amount=amount,
            description=description,
            status='COMPLETED'
        )
    
    # Send notification
    try:
        from users.notifications import notify_wallet_withdrawal, notify_low_balance
        notify_wallet_withdrawal(request.user, float(amount))
        if wallet.balance < 1000:
            notify_low_balance(request.user, float(wallet.balance))
    except Exception:
        pass

    return Response({
        'success': True,
        'message': f'Successfully withdrew {amount} {wallet.currency}',
        'wallet': {
            'balance': str(wallet.balance),
            'currency': wallet.currency,
        },
        'transaction': {
            'id': txn.id,
            'reference_id': txn.reference_id,
            'amount': str(txn.amount),
            'type': txn.transaction_type,
            'timestamp': txn.timestamp,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions(request):
    """
    Get paginated transaction history
    """
    try:
        wallet = Wallet.objects.get(user=request.user)
    except Wallet.DoesNotExist:
        return Response({
            'results': [],
            'count': 0,
            'next': None,
            'previous': None,
        })
    
    # Get query parameters for filtering
    transaction_type = request.query_params.get('type')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    # Base queryset
    transactions = wallet.transactions.all()
    
    # Apply filters
    if transaction_type:
        transactions = transactions.filter(transaction_type=transaction_type.upper())
    
    if start_date:
        transactions = transactions.filter(timestamp__gte=start_date)
    
    if end_date:
        transactions = transactions.filter(timestamp__lte=end_date)
    
    # Paginate
    paginator = TransactionPagination()
    page = paginator.paginate_queryset(transactions, request)
    
    # Serialize
    data = [{
        'id': txn.id,
        'reference_id': txn.reference_id,
        'type': txn.transaction_type,
        'amount': str(txn.amount),
        'description': txn.description,
        'status': txn.status,
        'timestamp': txn.timestamp,
        'metadata': txn.metadata,
    } for txn in page]
    
    return paginator.get_paginated_response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_timeline(request):
    """
    Get timeline-based view of wallet activity
    Grouped by date
    """
    try:
        wallet = Wallet.objects.get(user=request.user)
    except Wallet.DoesNotExist:
        return Response({'timeline': []})
    
    # Get date range
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    transactions = wallet.transactions.all()
    
    if start_date:
        transactions = transactions.filter(timestamp__gte=start_date)
    if end_date:
        transactions = transactions.filter(timestamp__lte=end_date)
    
    # Group by date
    timeline = {}
    for txn in transactions:
        date_key = txn.timestamp.date().isoformat()
        if date_key not in timeline:
            timeline[date_key] = []
        
        timeline[date_key].append({
            'id': txn.id,
            'reference_id': txn.reference_id,
            'type': txn.transaction_type,
            'amount': str(txn.amount),
            'description': txn.description,
            'status': txn.status,
            'time': txn.timestamp.time().isoformat(),
        })
    
    # Convert to sorted list
    timeline_list = [
        {
            'date': date,
            'transactions': txns
        }
        for date, txns in sorted(timeline.items(), reverse=True)
    ]
    
    return Response({'timeline': timeline_list})
