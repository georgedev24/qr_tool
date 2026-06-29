import { Field, Textarea } from './Field'

export default function TextForm({ data, onChange }) {
  return (
    <Field label="Text">
      <Textarea value={data.text} onChange={v => onChange('text', v)} placeholder="Any text..." rows={6} />
    </Field>
  )
}
