import { Field, Input } from './Field'

export default function LocationForm({ data, onChange }) {
  return (
    <>
      <Field label="Latitude"><Input value={data.lat} onChange={v => onChange('lat', v)} placeholder="37.9838" /></Field>
      <Field label="Longitude"><Input value={data.lng} onChange={v => onChange('lng', v)} placeholder="23.7275" /></Field>
      <Field label="Label (optional)"><Input value={data.label} onChange={v => onChange('label', v)} placeholder="Nerds Technology" /></Field>
    </>
  )
}
