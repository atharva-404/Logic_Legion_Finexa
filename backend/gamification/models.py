from django.db import models
from django.conf import settings
from django.utils import timezone


CHALLENGE_CATEGORY_CHOICES = [
    ('Tracking', 'Tracking'),
    ('Savings', 'Savings'),
    ('Optimization', 'Optimization'),
    ('Planning', 'Planning'),
    ('Investing', 'Investing'),
]

RARITY_CHOICES = [
    ('common', 'Common'),
    ('uncommon', 'Uncommon'),
    ('rare', 'Rare'),
    ('epic', 'Epic'),
]


class Challenge(models.Model):
    """
    Global challenge definitions available to all users.
    Admins create these; users subscribe via UserChallenge.
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    points = models.IntegerField(default=50)
    category = models.CharField(max_length=30, choices=CHALLENGE_CATEGORY_CHOICES, default='Savings')
    icon = models.CharField(max_length=50, default='target')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'title']

    def __str__(self):
        return self.title


class UserChallenge(models.Model):
    """
    Per-user challenge progress. Links a user to a Challenge with completion + streak tracking.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_challenges')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='user_challenges')
    completed = models.BooleanField(default=False)
    streak = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_toggled = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'challenge')
        ordering = ['-created_at']

    def toggle(self):
        """Toggle completion status and update streak."""
        self.completed = not self.completed
        now = timezone.now()
        if self.completed:
            self.streak += 1
            self.completed_at = now
        else:
            self.streak = max(0, self.streak - 1)
            self.completed_at = None
        self.last_toggled = now
        self.save()
        return self

    def __str__(self):
        status = 'done' if self.completed else 'pending'
        return f"{self.user.email} - {self.challenge.title} ({status})"


class Badge(models.Model):
    """Global badge definitions."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=50, blank=True, default="star")
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='common')
    threshold_score = models.IntegerField(default=70, help_text="Min health score to earn this badge")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['threshold_score', 'name']

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    """Tracks which badges a user has earned."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='user_badges')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.user.email} - {self.badge.name}"
