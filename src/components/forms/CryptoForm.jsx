import { Field, Input, Select } from './Field'

export default function CryptoForm({ data, onChange }) {
  return (
    <>
      <Field label="Coin">
        <Select
          value={data.coin}
          onChange={v => onChange('coin', v)}
          options={[
            { value: 'bitcoin', label: 'Bitcoin (BTC)' },
            { value: 'ethereum', label: 'Ethereum (ETH)' },
            { value: 'litecoin', label: 'Litecoin (LTC)' },
            { value: 'monero', label: 'Monero (XMR)' },
          ]}
        />
      </Field>
      <Field label="Address"><Input value={data.address} onChange={v => onChange('address', v)} placeholder="Wallet address" /></Field>
      <Field label="Amount (optional)"><Input value={data.amount} onChange={v => onChange('amount', v)} placeholder="0.001" /></Field>
    </>
  )
}
