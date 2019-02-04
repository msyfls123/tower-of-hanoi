import { DOMSource } from '@cycle/dom/lib/cjs/rxjs'
import { map, startWith } from 'rxjs/operators'

type CheckBoxEvent = Event & {
  target: HTMLElement & {
    checked?: Boolean
  }
}

export default function main(
  sources: {
    DOM: DOMSource
  }
) {
  const toggle$ = sources.DOM.select('input').events('change').pipe(
    map((ev: CheckBoxEvent) => ev.target.checked),
    startWith(false)
  )
  const DOM = toggle$.pipe(
    map(toggled => (
      <div>
        <label>
          <input attrs={{ id: 'he', type: 'checkbox', checked: toggled}}/>
          Toggle me
        </label>
        <p style={{ color: 'red', fontWeight: 'bold' }}>{toggled ? 'ON' : 'OFF'}</p>
      </div>
    ))
  )
  return {
    DOM
  }
}