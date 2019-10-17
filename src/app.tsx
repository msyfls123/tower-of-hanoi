import { Observable, combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'
import { run } from '@cycle/rxjs-run'
import { DOMSource, makeDOMDriver } from '@cycle/dom/lib/cjs/rxjs'
import { VNode } from '@cycle/dom'
import { Location, makeHashHistoryDriver } from '@cycle/history'
import { HTTPSource, makeHTTPDriver } from '@cycle/http/lib/cjs/rxjs'
import { RequestInput } from '@cycle/http'


import Nav from './nav'
import Toggle from './toggle'
import Github from './github'

import './styles/index.styl'

type mainFunction = (sources: {
  DOM: DOMSource
  history: Observable<Location>
  HTTP: HTTPSource
}) => {
  DOM: Observable<VNode>
  history: Observable<string>
  HTTP: Observable<RequestInput>
}

const main: mainFunction = (sources) => {
  const { DOM: navDOM$, history: navHistory$ } = Nav({
    history: sources.history,
    DOM: sources.DOM
  })
  const { DOM: toggleDOM$ } = Toggle({
    DOM: sources.DOM
  })
  const { DOM: githubDOM$, HTTP: githubHTTP$ } = Github({
    DOM: sources.DOM,
    HTTP: sources.HTTP
  })

  const sinks = {
    DOM: combineLatest(
      navDOM$,
      toggleDOM$,
      githubDOM$,
      sources.history,
    ).pipe(
      map(([navDOM, toggleDOM, githubDOM, location]) =>
        <div>
          {navDOM}
          {githubDOM}
          {toggleDOM}
          <p>I'm in {location.pathname}</p>
        </div>
      )
    ),
    history: navHistory$,
    HTTP: githubHTTP$,
  }
  return sinks
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  history: makeHashHistoryDriver(),
  HTTP: makeHTTPDriver(),
}

run(main, drivers)