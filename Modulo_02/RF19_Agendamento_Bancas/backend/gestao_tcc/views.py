from django.db import transaction
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import AgendamentoBanca
from .serializers import AgendamentoBancaSerializer


class AgendamentoBancaViewSet(viewsets.ModelViewSet):
    serializer_class = AgendamentoBancaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AgendamentoBanca.objects.select_related("tema_tcc").all()

        tema_tcc_id = self.request.query_params.get("tema_tcc_id")
        local = self.request.query_params.get("local")
        data_inicio = self.request.query_params.get("data_inicio")
        data_fim = self.request.query_params.get("data_fim")

        if tema_tcc_id:
            queryset = queryset.filter(tema_tcc_id=tema_tcc_id)

        if local:
            queryset = queryset.filter(local_ou_link__icontains=local)

        if data_inicio:
            queryset = queryset.filter(data_hora_inicio__gte=data_inicio)

        if data_fim:
            queryset = queryset.filter(data_hora_inicio__lte=data_fim)

        return queryset

    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save()

    @transaction.atomic
    def perform_update(self, serializer):
        serializer.save()
