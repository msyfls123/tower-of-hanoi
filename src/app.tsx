import { Observable, combineLatest, concat } from 'rxjs'
import { map, startWith, tap, distinctUntilChanged, take, skip, filter, mergeAll } from 'rxjs/operators'
import { run } from '@cycle/rxjs-run'
import { DOMSource, makeDOMDriver } from '@cycle/dom/lib/cjs/rxjs'
import { VNode } from '@cycle/dom'
import { Location, makeHashHistoryDriver } from '@cycle/history'
import { HTTPSource, makeHTTPDriver } from '@cycle/http/lib/cjs/rxjs'
import { RequestInput } from '@cycle/http'

import ACCESS_TOKEN from './access-token'

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

type CheckBoxEvent = Event & {
  target: HTMLElement & {
    checked?: Boolean
  }
}

const main: mainFunction = (sources) => {
  const toggle$ = sources.DOM.select('input').events('change').pipe(
    map((ev: CheckBoxEvent) => ev.target.checked),
    startWith(false)
  )
  const link$ = sources.DOM.select('nav a').events('click').pipe(
    tap((e: Event) => e.preventDefault()),
    map((e: Event) => (e.target as HTMLAnchorElement).pathname)
  )
  const fetchUser$ = sources.DOM.select('#user-form').events('submit').pipe(
    tap((e: Event) => e.preventDefault()),
    map((e: Event): string => (e.target as HTMLFormElement).user.value),
    filter(user => !!user),
    map((user) => ({
      category: 'user',
      url: `https://api.github.com/users/${user}?access_token=${ACCESS_TOKEN}`,
      method: 'GET'
    }))
  )
  const sinks = {
    DOM: combineLatest(
      sources.history,
      toggle$,
      sources.HTTP.select('user').pipe(
        mergeAll(),
        map(res => res.body),
        startWith(null),
      )
    ).pipe(
      map(([location, toggled, user]) =>
        <div>
          <nav>
            { ['/', '/about', '/help'].map((path) => (
              <a class={{
                active: location.pathname === path,
                link: true
              }} href={path}>
                {path}
              </a>
            ))}
          </nav>
          <label><input attrs={{ id: 'he', type: 'checkbox', checked: toggled}}/> Toggle me</label>
          <p style={{ color: 'red', fontWeight: 'bold' }}>{toggled ? 'ON' : 'OFF'}</p>
          <div className='github'>
            { user && <table>
              { (Object as any).entries(user).map(([key, value]: [string, any]) => <tr>
                <td>{key}</td>
                <td>{value}</td>
              </tr>) }
            </table> }
            <form id='user-form'>
              <input name='user'></input>
              <button type='submit'>Search</button>
            </form>
          </div>
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
    ),
    HTTP: fetchUser$,
  }
  return sinks
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  history: makeHashHistoryDriver(),
  HTTP: makeHTTPDriver(),
}

run(main, drivers)