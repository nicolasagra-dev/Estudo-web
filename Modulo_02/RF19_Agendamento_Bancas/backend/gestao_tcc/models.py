import uuid

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q


class AgendamentoBanca(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tema_tcc = models.OneToOneField(
        "TemaTcc",
        on_delete=models.PROTECT,
        related_name="agendamento_banca",
    )
    data_hora_inicio = models.DateTimeField()
    data_hora_fim = models.DateTimeField()
    local_ou_link = models.CharField(max_length=255)

    class Meta:
        db_table = "agendamento_banca"
        ordering = ["data_hora_inicio"]
        indexes = [
            models.Index(fields=["local_ou_link", "data_hora_inicio", "data_hora_fim"]),
            models.Index(fields=["data_hora_inicio"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(data_hora_fim__gt=F("data_hora_inicio")),
                name="agendamento_banca_fim_apos_inicio",
            ),
        ]

    def clean(self):
        super().clean()

        if self.data_hora_inicio and self.data_hora_fim:
            if self.data_hora_fim <= self.data_hora_inicio:
                raise ValidationError(
                    {"data_hora_fim": "A data/hora final deve ser posterior ao inicio."}
                )

            conflito = AgendamentoBanca.objects.filter(
                local_ou_link__iexact=self.local_ou_link.strip(),
                data_hora_inicio__lt=self.data_hora_fim,
                data_hora_fim__gt=self.data_hora_inicio,
            )

            if self.pk:
                conflito = conflito.exclude(pk=self.pk)

            if conflito.exists():
                raise ValidationError(
                    {
                        "local_ou_link": (
                            "Ja existe uma banca agendada neste local/link "
                            "com horario sobreposto."
                        )
                    }
                )

    def __str__(self):
        return f"{self.tema_tcc_id} - {self.local_ou_link} - {self.data_hora_inicio}"
