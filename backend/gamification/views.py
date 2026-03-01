from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Badge, Challenge, UserChallenge, UserBadge
from .serializers import (
    BadgeSerializer,
    UserBadgeSerializer,
    ChallengeSerializer,
    UserChallengeSerializer,
)


# ── Challenges ────────────────────────────────────────────────────

class ChallengeListView(generics.ListAPIView):
    """GET /api/gamification/challenges/ — all active global challenges."""
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Challenge.objects.filter(is_active=True)


class UserChallengeListView(generics.ListAPIView):
    """
    GET /api/gamification/my-challenges/
    Returns the authenticated user's challenges.
    Auto-seeds any missing challenges so new users get all of them.
    """
    serializer_class = UserChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Auto-seed: create UserChallenge rows for any Challenge the user hasn't joined yet
        existing_ids = set(
            UserChallenge.objects.filter(user=user).values_list('challenge_id', flat=True)
        )
        new_challenges = Challenge.objects.filter(is_active=True).exclude(id__in=existing_ids)
        UserChallenge.objects.bulk_create(
            [UserChallenge(user=user, challenge=c) for c in new_challenges],
            ignore_conflicts=True,
        )
        return UserChallenge.objects.filter(user=user).select_related('challenge')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_challenge(request, pk):
    """
    POST /api/gamification/my-challenges/<id>/toggle/
    Toggle completion of a user challenge. Adjusts streak.
    """
    try:
        uc = UserChallenge.objects.select_related('challenge').get(pk=pk, user=request.user)
    except UserChallenge.DoesNotExist:
        return Response({'error': 'Challenge not found'}, status=status.HTTP_404_NOT_FOUND)

    uc.toggle()
    return Response(UserChallengeSerializer(uc).data, status=status.HTTP_200_OK)


# ── Badges ────────────────────────────────────────────────────────

class BadgeListView(generics.ListAPIView):
    """GET /api/gamification/badges/ — all badge definitions."""
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Badge.objects.all()


class UserBadgeListView(generics.ListAPIView):
    """
    GET /api/gamification/my-badges/
    Returns the user's earned badges.
    """
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user).select_related('badge')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def gamification_summary(request):
    """
    GET /api/gamification/summary/
    Combined overview: challenges stats, badges, streaks.
    """
    user = request.user
    user_challenges = UserChallenge.objects.filter(user=user)
    completed = user_challenges.filter(completed=True).count()
    total = user_challenges.count()
    max_streak = 0
    if total > 0:
        max_streak = user_challenges.order_by('-streak').values_list('streak', flat=True).first() or 0

    earned_badges = UserBadge.objects.filter(user=user).select_related('badge')
    all_badges = Badge.objects.all()

    return Response({
        'challenges': {
            'completed': completed,
            'total': total,
            'max_streak': max_streak,
        },
        'badges': {
            'earned': UserBadgeSerializer(earned_badges, many=True).data,
            'all': BadgeSerializer(all_badges, many=True).data,
        },
    })
