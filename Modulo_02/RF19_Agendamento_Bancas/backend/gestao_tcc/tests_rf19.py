from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from .models import AgendamentoBanca
from .serializers import AgendamentoBancaSerializer


class AgendamentoBancaSerializerTest(TestCase):
    """Testes de referencia para integrar ao suite do app gestao_tcc.

    Estes testes assumem que os models TemaTcc, VersaoTrabalho e
    ParecerOrientador dos RFs 14, 17 e 18 ja existem no projeto.
    Ajuste os dados obrigatorios conforme a implementacao local desses models.
    """

    def test_rejeita_intervalo_invalido(self):
        inicio = timezone.now() + timedelta(days=10)
        fim = inicio - timedelta(hours=1)

        serializer = AgendamentoBancaSerializer(
            data={
                "tema_tcc_id": "00000000-0000-0000-0000-000000000000",
                "data_hora_inicio": inicio.isoformat(),
                "data_hora_fim": fim.isoformat(),
                "local_ou_link": "Sala 102",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("data_hora_fim", serializer.errors)

    def test_consulta_de_conflito_usa_sobreposicao_de_intervalos(self):
        inicio = timezone.now() + timedelta(days=10)
        fim = inicio + timedelta(hours=2)

        queryset = AgendamentoBanca.objects.filter(
            local_ou_link__iexact="Sala 102",
            data_hora_inicio__lt=fim,
            data_hora_fim__gt=inicio,
        )

        self.assertFalse(queryset.exists())
