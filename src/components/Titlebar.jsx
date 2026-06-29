import './Titlebar.css'

export default function Titlebar() {
  const minimize = () => window.electronAPI?.minimize()
  const maximize = () => window.electronAPI?.maximize()
  const close = () => window.electronAPI?.close()

  return (
    <div className="titlebar">
      <div className="titlebar-controls">
        <button className="ctrl ctrl-close" onClick={close} title="Close" />
        <button className="ctrl ctrl-min" onClick={minimize} title="Minimize" />
        <button className="ctrl ctrl-max" onClick={maximize} title="Maximize" />
      </div>
      <span className="titlebar-title">QR Tool</span>
      <div className="titlebar-spacer" />
    </div>
  )
}
