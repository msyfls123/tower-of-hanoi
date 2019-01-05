import { map, startWith } from 'rxjs/operators'
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver, div, input, p } from '@cycle/dom'
import { DOMSource } from '@cycle/dom/src/rxjs'

document.body.innerHTML = "<div id='app'>hello world</div>"

type Sources = {
  DOM: DOMSource
}

type SelfEvent = Event & {
  target: HTMLElement & {
    checked: Boolean
  }
}

function main(sources: Sources) {
  const sinks = {
    DOM: sources.DOM.select('input').events('change').pipe(
      map((ev: SelfEvent) => ev.target.checked),
      startWith(false),
      map(toggled =>
        div([
          input({attrs: {type: 'checkbox'}}), 'Toggle me',
          p(toggled ? 'ON' : 'off')
        ])
      )
    )
  }
  return sinks
}

const drivers = {
  DOM: makeDOMDriver('#app') as any
}

run(main, drivers)