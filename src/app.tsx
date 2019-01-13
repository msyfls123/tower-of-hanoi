import { Observable, combineLatest, concat } from 'rxjs'
import { map, startWith, tap, distinctUntilChanged, take, skip } from 'rxjs/operators'
import { run } from '@cycle/rxjs-run'
import { DOMSource, makeDOMDriver } from '@cycle/dom/lib/cjs/rxjs'
import { VNode } from '@cycle/dom'
import { Location, makeHashHistoryDriver  } from '@cycle/history'


document.body.innerHTML = "<div id='app'>hello world</div>"

type mainFunction = (sources: {
  DOM: DOMSource
  history: Observable<Location>
}) => {
  DOM: Observable<VNode>
  history: Observable<string>
}

type CheckBoxEvent = Event & {
  target: HTMLElement & {
    checked?: Boolean
  }
}

interface AnchorHTMLElement extends HTMLElement {
  pathname?: string
}

const main: mainFunction = (sources) => {
  const toggle$ = sources.DOM.select('input').events('change').pipe(
    map((ev: CheckBoxEvent) => ev.target.checked),
    startWith(false)
  )
  const link$ = sources.DOM.select('nav a').events('click').pipe(
    tap((e: Event) => e.preventDefault()),
    map((e: Event) => (e.target as AnchorHTMLElement).pathname)
  )
  const sinks = {
    DOM: combineLatest(sources.history, toggle$).pipe(
      map(([location, toggled]) =>
        <div>
          <nav>
            { ['/', '/about', '/help'].map((path) => (
              <a href={path} style={{
                color: path === location.pathname ? 'blue' : 'gray',
                padding: '5px',
                margin: '5px',
                borderRadius: '2px',
                background: '#f0f0f0'
              }}>
                {path}
              </a>
            ))}
          </nav>
          <label><input attrs={{ id: 'he', type: 'checkbox', checked: toggled}}/> Toggle me</label>
          <p style={{ color: 'red', fontWeight: 'bold' }}>{toggled ? 'ON' : 'OFF'}</p>
          <p>I'm in {location.pathname}</p>
        </div>
      )
    ),
    history: concat(
      sources.history.pipe(
        map(location => location.pathname),
        take(1),
      ),
      link$,
    ).pipe(
      distinctUntilChanged(),
      skip(1),
    )
  }
  return sinks
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  history: makeHashHistoryDriver(),
}

run(main, drivers)