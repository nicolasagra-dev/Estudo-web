import uuid

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q


class Aluno(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome_completo = models.CharField(max_length=150)
    matricula = models.CharField(max_length=20, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    senha_hash = models.CharField(max_length=255)
    curso = models.CharField(max_length=100)

    class Meta:
        db_table = "aluno"
        ordering = ["nome_completo"]

    def __str__(self):
        return self.nome_completo


class TemaTcc(models.Model):
    STATUS_PENDENTE = "Pendente"
    STATUS_APROVADO = "Aprovado"
    STATUS_REJEITADO = "Rejeitado"

    STATUS_CHOICES = [
        (STATUS_PENDENTE, "Pendente"),
        (STATUS_APROVADO, "Aprovado"),
        (STATUS_REJEITADO, "Rejeitado"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name="temas_tcc")
    titulo = models.CharField(max_length=255)
    resumo = models.TextField()
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default=STATUS_PENDENTE,
    )
    data_submissao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tema_tcc"
        ordering = ["-data_submissao"]

    def __str__(self):
        return self.titulo


class VersaoTrabalho(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tema_tcc = models.ForeignKey(
        TemaTcc,
        on_delete=models.CASCADE,
        related_name="versoes",
    )
    arquivo_url = models.CharField(max_length=255)
    versao = models.PositiveIntegerField()
    data_envio = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "versao_trabalho"
        ordering = ["tema_tcc", "-versao"]
        constraints = [
            models.UniqueConstraint(
                fields=["tema_tcc", "versao"],
                name="versao_trabalho_tema_versao_unica",
            ),
        ]

    def __str__(self):
        return f"{self.tema_tcc_id} - v{self.versao}"


class ParecerOrientador(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    versao = models.OneToOneField(
        VersaoTrabalho,
        on_delete=models.CASCADE,
        related_name="parecer_orientador",
    )
    comentarios = models.TextField()
    apto_banca = models.BooleanField(default=False)
    data_parecer = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "parecer_orientador"
        ordering = ["-data_parecer"]

    def __str__(self):
        return f"Parecer {self.versao_id} - apto={self.apto_banca}"


class AgendamentoBanca(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tema_tcc = models.OneToOneField(
        TemaTcc,
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
                condition=Q(data_hora_fim__gt=F("data_hora_inicio")),
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
