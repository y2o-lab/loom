type FieldProps = { label: string; name: string; placeholder: string; required: boolean; disabled?: boolean };
function Required({ required }: { required: boolean }) { return required ? <span className="loom-required">必須</span> : <span className="loom-optional">任意</span>; }
export function FormHeader({ brand, title, description }: { brand: string; title: string; description: string }) {
  return <header className="loom-form-header"><div className="loom-form-brand"><span aria-hidden="true">L</span>{brand}</div><h1>{title}</h1><p>{description}</p></header>;
}
export function TextField({ label, name, placeholder, required, disabled, inputType }: FieldProps & { inputType: "text" | "email" | "tel" }) {
  return <label className="loom-form-field" htmlFor={`form-${name}`}><span>{label}<Required required={required}/></span><input id={`form-${name}`} name={name} type={inputType} placeholder={placeholder} required={required} disabled={disabled}/></label>;
}
export function SelectField({ label, name, placeholder, required, disabled, options }: FieldProps & { options: string }) {
  return <label className="loom-form-field" htmlFor={`form-${name}`}><span>{label}<Required required={required}/></span><select id={`form-${name}`} name={name} required={required} disabled={disabled} defaultValue=""><option value="">{placeholder}</option>{options.split(/\r?\n/).map(value=>value.trim()).filter(Boolean).map((option,index)=><option value={option} key={`${index}-${option}`}>{option}</option>)}</select></label>;
}
export function TextAreaField({ label, name, placeholder, required, disabled, rows }: FieldProps & { rows: number }) {
  return <label className="loom-form-field" htmlFor={`form-${name}`}><span>{label}<Required required={required}/></span><textarea id={`form-${name}`} name={name} placeholder={placeholder} required={required} disabled={disabled} rows={rows}/></label>;
}
export function CheckboxField({ label, name, required, disabled }: { label: string; name: string; required: boolean; disabled?: boolean }) {
  return <label className="loom-form-checkbox"><input type="checkbox" name={name} required={required} disabled={disabled}/><span>{label}</span><Required required={required}/></label>;
}
export function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  return <button className="loom-form-submit" type="submit" disabled={disabled}>{label}<span aria-hidden="true"> →</span></button>;
}
export function Notice({ text }: { text: string }) { return <aside className="loom-form-notice"><span aria-hidden="true">i</span><p>{text}</p></aside>; }
