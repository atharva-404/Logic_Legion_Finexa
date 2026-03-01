from rest_framework import serializers
from .models import Badge, Challenge, UserChallenge, UserBadge


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = ('id', 'title', 'description', 'points', 'category', 'icon', 'is_active')


class UserChallengeSerializer(serializers.ModelSerializer):
    """Flat serializer that merges Challenge fields into the response."""
    id = serializers.IntegerField(source='pk', read_only=True)
    challenge_id = serializers.IntegerField(source='challenge.id', read_only=True)
    title = serializers.CharField(source='challenge.title', read_only=True)
    description = serializers.CharField(source='challenge.description', read_only=True)
    points = serializers.IntegerField(source='challenge.points', read_only=True)
    category = serializers.CharField(source='challenge.category', read_only=True)
    icon = serializers.CharField(source='challenge.icon', read_only=True)

    class Meta:
        model = UserChallenge
        fields = (
            'id', 'challenge_id', 'title', 'description', 'points',
            'category', 'icon', 'completed', 'streak',
            'completed_at', 'last_toggled', 'created_at',
        )
        read_only_fields = ('id', 'completed_at', 'last_toggled', 'created_at')


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ('id', 'name', 'description', 'icon', 'rarity', 'threshold_score')


class UserBadgeSerializer(serializers.ModelSerializer):
    badge_id = serializers.IntegerField(source='badge.id', read_only=True)
    name = serializers.CharField(source='badge.name', read_only=True)
    description = serializers.CharField(source='badge.description', read_only=True)
    icon = serializers.CharField(source='badge.icon', read_only=True)
    rarity = serializers.CharField(source='badge.rarity', read_only=True)
    threshold_score = serializers.IntegerField(source='badge.threshold_score', read_only=True)

    class Meta:
        model = UserBadge
        fields = ('id', 'badge_id', 'name', 'description', 'icon', 'rarity', 'threshold_score', 'earned_at')
        read_only_fields = ('id', 'earned_at')
