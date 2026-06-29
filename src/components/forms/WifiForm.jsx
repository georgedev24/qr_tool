import { Field, Input, Select, Checkbox } from './Field'

export default function WifiForm({ data, onChange }) {
  return (
    <>
      <Field label="Network name (SSID)">
        <Input value={data.ssid} onChange={v => onChange('ssid', v)} placeholder="MyNetwork" />
      </Field>
      <Field label="Password">
        <Input value={data.password} onChange={v => onChange('password', v)} placeholder="••••••••" type="password" />
      </Field>
      <Field label="Security">
        <Select
          value={data.security}
          onChange={v => onChange('security', v)}
          options={[
            { value: 'WPA', label: 'WPA / WPA2' },
            { value: 'WEP', label: 'WEP' },
            { value: 'nopass', label: 'None (open)' },
          ]}
        />
      </Field>
      <Checkbox label="Hidden network" checked={data.hidden} onChange={v => onChange('hidden', v)} />
    </>
  )
}
