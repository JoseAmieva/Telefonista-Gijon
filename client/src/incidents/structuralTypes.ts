export type ZonaUbicacion = "urbana" | "rural" | "";

export type TipoEstructura = "piso" | "unifamiliar" | "local" | "nave" | "garaje" | "otros" | "";

export type IdentificacionAlertante =
  | "ocupante"
  | "vecino_mismo"
  | "vecino_otro"
  | "112_sin_alertante"
  | "";

export const emptyStructuralForm = (): StructuralFormState => ({
  telefono_alertante: "",
  ubicacion_zona: "",
  urb_calle: "",
  urb_portal: "",
  urb_piso: "",
  urb_puerta: "",
  urb_barrio: "",
  urb_calle_aneja: "",
  rur_via: "",
  rur_parroquia: "",
  rur_via_aneja: "",
  tipo_estructura: "",
  tipo_estructura_otros: "",
  identificacion_alertante: "",
  /* Ocupante */
  oc_humo_o_llama: "",
  oc_origen: "",
  oc_descripcion: "",
  oc_mas_ocupantes: "",
  oc_num_ocupantes: "",
  oc_pueden_salir: "",
  oc_cuantos_no_pueden: "",
  oc_motivo_no_salir: "",
  oc_puerta_abierta: "",
  oc_puerta_detalle: "",
  oc_ventanas_otra_fachada: "",
  oc_ventanas_otra_calle: "",
  oc_ventanas_solo_patio: "",
  /* Vecino mismo edificio */
  vm_donde: "",
  vm_humo_llama: "",
  vm_origen: "",
  vm_origen_ventana_portal: "",
  vm_ventana_calle: "",
  vm_origen_puerta_picar: "",
  vm_oyen_gente: "",
  vm_humo_fuera: "",
  vm_humo_denso_color: "",
  vm_descripcion: "",
  /* Vecino otro / transeúnte */
  vo_donde: "",
  vo_distancia: "",
  vo_humo_llama: "",
  vo_origen: "",
  vo_cantidad_humo: "",
  vo_descripcion: "",
});

export type StructuralFormState = {
  telefono_alertante: string;
  ubicacion_zona: ZonaUbicacion;
  urb_calle: string;
  urb_portal: string;
  urb_piso: string;
  urb_puerta: string;
  urb_barrio: string;
  urb_calle_aneja: string;
  rur_via: string;
  rur_parroquia: string;
  rur_via_aneja: string;
  tipo_estructura: TipoEstructura;
  tipo_estructura_otros: string;
  identificacion_alertante: IdentificacionAlertante;
  oc_humo_o_llama: string;
  oc_origen: string;
  oc_descripcion: string;
  oc_mas_ocupantes: string;
  oc_num_ocupantes: string;
  oc_pueden_salir: string;
  oc_cuantos_no_pueden: string;
  oc_motivo_no_salir: string;
  oc_puerta_abierta: string;
  oc_puerta_detalle: string;
  oc_ventanas_otra_fachada: string;
  oc_ventanas_otra_calle: string;
  oc_ventanas_solo_patio: string;
  vm_donde: string;
  vm_humo_llama: string;
  vm_origen: string;
  vm_origen_ventana_portal: string;
  vm_ventana_calle: string;
  vm_origen_puerta_picar: string;
  vm_oyen_gente: string;
  vm_humo_fuera: string;
  vm_humo_denso_color: string;
  vm_descripcion: string;
  vo_donde: string;
  vo_distancia: string;
  vo_humo_llama: string;
  vo_origen: string;
  vo_cantidad_humo: string;
  vo_descripcion: string;
};
