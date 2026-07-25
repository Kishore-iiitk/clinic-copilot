/**
 * Hand-written additions to the generated API client.
 *
 * These follow the exact same shape/conventions as the orval-generated
 * code in ./generated/api.ts, but live here (untouched by codegen) so that
 * re-running `orval` later will never delete them.
 */
import { useMutation } from "@tanstack/react-query";
import type {
  MutationFunction,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";

import type { PatientSummary } from "./generated/api.schemas";
import { customFetch } from "./client";
import type { ErrorType, BodyType } from "./client";

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

/** Body for POST /api/patients — nurse "Add Patient" form (includes the first vitals reading) */
export interface PatientInput {
  name: string;
  bedNumber: string;
  age: number;
  ward: string;
  diagnosis: string;
  heartRate: number;
  spo2: number;
  bpSystolic: number;
  bpDiastolic: number;
  temperature: number;
  respiratoryRate: number;
}

export interface DeleteNoteResult {
  success: boolean;
  id: number;
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/patients — create patient
// ─────────────────────────────────────────────────────────────────────────

export const getCreatePatientUrl = () => `/api/patients`;

/**
 * @summary Create a new patient with an initial vitals reading (Nurse "Add Patient")
 */
export const createPatient = async (
  patientInput: BodyType<PatientInput>,
  options?: RequestInit,
): Promise<PatientSummary> => {
  return customFetch<PatientSummary>(getCreatePatientUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(patientInput),
  });
};

export const getCreatePatientMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createPatient>>,
    TError,
    { data: BodyType<PatientInput> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof createPatient>>,
  TError,
  { data: BodyType<PatientInput> },
  TContext
> => {
  const mutationKey = ["createPatient"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof createPatient>>,
    { data: BodyType<PatientInput> }
  > = (props) => {
    const { data } = props ?? {};
    return createPatient(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type CreatePatientMutationResult = NonNullable<
  Awaited<ReturnType<typeof createPatient>>
>;
export type CreatePatientMutationBody = BodyType<PatientInput>;
export type CreatePatientMutationError = ErrorType<unknown>;

/**
 * @summary Create a new patient with an initial vitals reading (Nurse "Add Patient")
 */
export const useCreatePatient = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createPatient>>,
    TError,
    { data: BodyType<PatientInput> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof createPatient>>,
  TError,
  { data: BodyType<PatientInput> },
  TContext
> => {
  return useMutation(getCreatePatientMutationOptions(options));
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/patients/:id/notes/:noteId — delete a note (e.g. a SOAP note)
// ─────────────────────────────────────────────────────────────────────────

export const getDeletePatientNoteUrl = (id: number, noteId: number) =>
  `/api/patients/${id}/notes/${noteId}`;

/**
 * @summary Delete a clinical note. Removes it from the shared notes list,
 * so it disappears for both Doctor and Nurse views.
 */
export const deletePatientNote = async (
  id: number,
  noteId: number,
  options?: RequestInit,
): Promise<DeleteNoteResult> => {
  return customFetch<DeleteNoteResult>(getDeletePatientNoteUrl(id, noteId), {
    ...options,
    method: "DELETE",
  });
};

export const getDeletePatientNoteMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deletePatientNote>>,
    TError,
    { id: number; noteId: number },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof deletePatientNote>>,
  TError,
  { id: number; noteId: number },
  TContext
> => {
  const mutationKey = ["deletePatientNote"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof deletePatientNote>>,
    { id: number; noteId: number }
  > = (props) => {
    const { id, noteId } = props ?? {};
    return deletePatientNote(id, noteId, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type DeletePatientNoteMutationResult = NonNullable<
  Awaited<ReturnType<typeof deletePatientNote>>
>;
export type DeletePatientNoteMutationError = ErrorType<unknown>;

/**
 * @summary Delete a clinical note. Removes it from the shared notes list,
 * so it disappears for both Doctor and Nurse views.
 */
export const useDeletePatientNote = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deletePatientNote>>,
    TError,
    { id: number; noteId: number },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof deletePatientNote>>,
  TError,
  { id: number; noteId: number },
  TContext
> => {
  return useMutation(getDeletePatientNoteMutationOptions(options));
};
