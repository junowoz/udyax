"use client";

import { Button, FormGroup, InputGroup, Intent } from "@blueprintjs/core";
import { useMemo, useState } from "react";

type FormData = {
  orgao: string;
  nome: string;
  email: string;
  integracao: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialData: FormData = {
  orgao: "",
  nome: "",
  email: "",
  integracao: "Tráfego",
};

const institutionalEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.orgao.trim()) errors.orgao = "Informe o órgão ou cidade.";
  if (!data.nome.trim()) errors.nome = "Informe seu nome.";
  if (!data.email.trim()) {
    errors.email = "Informe o e-mail institucional.";
  } else if (!institutionalEmailPattern.test(data.email)) {
    errors.email = "Use um e-mail válido.";
  }

  return errors;
}

export default function LeadCaptureForm() {
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const isValid = useMemo(() => Object.keys(validate(data)).length === 0, [data]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentErrors = validate(data);
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
  }

  return (
    <form className="udy-lead-form" onSubmit={onSubmit} noValidate>
      <FormGroup
        label="Órgão / cidade"
        labelFor="orgao"
        helperText={errors.orgao}
        intent={errors.orgao ? Intent.DANGER : Intent.NONE}
      >
        <InputGroup
          id="orgao"
          value={data.orgao}
          intent={errors.orgao ? Intent.DANGER : Intent.NONE}
          placeholder="Ex.: Prefeitura de Campinas"
          onChange={(event) => setData((prev) => ({ ...prev, orgao: event.target.value }))}
        />
      </FormGroup>

      <FormGroup
        label="Nome"
        labelFor="nome"
        helperText={errors.nome}
        intent={errors.nome ? Intent.DANGER : Intent.NONE}
      >
        <InputGroup
          id="nome"
          value={data.nome}
          intent={errors.nome ? Intent.DANGER : Intent.NONE}
          placeholder="Nome completo"
          onChange={(event) => setData((prev) => ({ ...prev, nome: event.target.value }))}
        />
      </FormGroup>

      <FormGroup
        label="E-mail institucional"
        labelFor="email"
        helperText={errors.email}
        intent={errors.email ? Intent.DANGER : Intent.NONE}
      >
        <InputGroup
          id="email"
          type="email"
          value={data.email}
          intent={errors.email ? Intent.DANGER : Intent.NONE}
          placeholder="voce@orgao.gov.br"
          onChange={(event) => setData((prev) => ({ ...prev, email: event.target.value }))}
        />
      </FormGroup>

      <FormGroup label="O que quer integrar primeiro" labelFor="integracao">
        <div className="bp6-html-select udy-select-wrap">
          <select
            id="integracao"
            value={data.integracao}
            onChange={(event) => setData((prev) => ({ ...prev, integracao: event.target.value }))}
          >
            <option>Tráfego</option>
            <option>Resíduos</option>
            <option>Iluminação</option>
            <option>Segurança</option>
            <option>Água</option>
            <option>Outro</option>
          </select>
        </div>
      </FormGroup>

      <div className="udy-lead-actions">
        <Button large type="submit" intent="primary" icon="endorsed" text="Solicitar piloto" />
        <Button
          large
          type="button"
          icon="predictive-analysis"
          text="Conversar com engenharia"
          disabled={!isValid}
        />
      </div>

      {submitted ? (
        <p className="udy-form-ok" role="status">
          Recebido. Sua solicitação foi validada localmente para esta demonstração.
        </p>
      ) : null}
    </form>
  );
}
