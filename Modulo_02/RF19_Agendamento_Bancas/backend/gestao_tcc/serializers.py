from rest_framework import serializers

from .models import AgendamentoBanca, ParecerOrientador, TemaTcc


class AgendamentoBancaSerializer(serializers.ModelSerializer):
    tema_tcc_id = serializers.PrimaryKeyRelatedField(
        queryset=TemaTcc.objects.all(),
        source="tema_tcc",
    )

    class Meta:
        model = AgendamentoBanca
        fields = [
            "id",
            "tema_tcc_id",
            "data_hora_inicio",
            "data_hora_fim",
            "local_ou_link",
        ]
        read_only_fields = ["id"]

    def validate_local_ou_link(self, value):
        local = value.strip()
        if not local:
            raise serializers.ValidationError("Informe a sala fisica ou link da banca.")
        return local

    def validate(self, attrs):
        instance = self.instance

        tema_tcc = attrs.get("tema_tcc", getattr(instance, "tema_tcc", None))
        data_hora_inicio = attrs.get(
            "data_hora_inicio", getattr(instance, "data_hora_inicio", None)
        )
        data_hora_fim = attrs.get(
            "data_hora_fim", getattr(instance, "data_hora_fim", None)
        )
        local_ou_link = attrs.get("local_ou_link", getattr(instance, "local_ou_link", ""))

        if data_hora_inicio and data_hora_fim and data_hora_fim <= data_hora_inicio:
            raise serializers.ValidationError(
                {"data_hora_fim": "A data/hora final deve ser posterior ao inicio."}
            )

        if tema_tcc and not self._tema_tem_parecer_favoravel(tema_tcc):
            raise serializers.ValidationError(
                {
                    "tema_tcc_id": (
                        "So e possivel agendar banca para tema com parecer "
                        "favoravel do orientador."
                    )
                }
            )

        if data_hora_inicio and data_hora_fim and local_ou_link:
            conflito = AgendamentoBanca.objects.filter(
                local_ou_link__iexact=local_ou_link.strip(),
                data_hora_inicio__lt=data_hora_fim,
                data_hora_fim__gt=data_hora_inicio,
            )

            if instance:
                conflito = conflito.exclude(pk=instance.pk)

            if conflito.exists():
                raise serializers.ValidationError(
                    {
                        "local_ou_link": (
                            "Ja existe uma banca agendada neste local/link "
                            "com horario sobreposto."
                        )
                    }
                )

        return attrs

    def _tema_tem_parecer_favoravel(self, tema_tcc):
        return ParecerOrientador.objects.filter(
            versao__tema_tcc=tema_tcc,
            apto_banca=True,
        ).exists()
