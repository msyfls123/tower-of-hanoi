import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { run } from '@cycle/rxjs-run'
import { DOMSource, makeDOMDriver } from '@cycle/dom/lib/cjs/rxjs'
import { VNode } from '@cycle/dom'


document.body.innerHTML = "<div id='app'>hello world</div>"

type mainFunction = (sources: {
  DOM: DOMSource
}) => {
  DOM: Observable<VNode>
}

type CheckBoxEvent = Event & {
  target: HTMLElement & {
    checked?: Boolean
  }
}

const main: mainFunction = (sources) => {
  const sinks = {
    DOM: sources.DOM.select('input').events('change').pipe(
      map((ev: CheckBoxEvent) => ev.target.checked),
      startWith(false),
      map(toggled =>
        <div>
          <label><input attrs={{ id: 'he', type: 'checkbox', checked: toggled}}/> Toggle me</label>
          <p style={{ color: 'red', fontWeight: 'bold' }}>{toggled ? 'ON' : 'OFF'}</p>
        </div>
      )
    )
  }
  return sinks
}

const drivers = {
  DOM: makeDOMDriver('#app')
}

run(main, drivers)