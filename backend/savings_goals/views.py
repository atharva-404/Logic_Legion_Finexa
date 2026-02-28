from rest_framework import generics, permissions
from .models import SavingsGoal
from .serializers import GoalSerializer

class GoalListCreateView(generics.ListCreateAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        goal = serializer.save(user=self.request.user)
        try:
            from users.notifications import notify_goal_created
            notify_goal_created(self.request.user, goal.title, float(goal.target_amount))
        except Exception:
            pass


class GoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        old_current = self.get_object().current_amount
        goal = serializer.save()
        new_current = goal.current_amount
        # Check for milestone notifications
        try:
            if new_current > old_current:
                progress = goal.progress_percentage
                old_progress = (float(old_current) / float(goal.target_amount) * 100) if goal.target_amount > 0 else 0
                from users.notifications import notify_goal_progress, notify_goal_completed
                # Check milestones: 25%, 50%, 75%, 100%
                for milestone in [25, 50, 75]:
                    if old_progress < milestone <= progress:
                        notify_goal_progress(self.request.user, goal.title, progress)
                        break
                if progress >= 100 and old_progress < 100:
                    notify_goal_completed(self.request.user, goal.title)
        except Exception:
            pass
