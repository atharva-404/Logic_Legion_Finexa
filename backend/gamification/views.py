from rest_framework import generics, permissions
from .models import Badge
from .serializers import BadgeSerializer

class BadgeListView(generics.ListAPIView):
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Badge.objects.filter(user=self.request.user)
