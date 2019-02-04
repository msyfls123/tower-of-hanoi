import { DOMSource } from '@cycle/dom/lib/cjs/rxjs'
import { HTTPSource } from '@cycle/http/lib/cjs/rxjs'
import { map, tap, filter, mergeAll, startWith, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

import ACCESS_TOKEN from './access-token'

type ResponseType = {
  data?: any
  error?: any
}

export default function main(sources: {
  DOM: DOMSource
  HTTP: HTTPSource
}) {
  const githubFetch$ = sources.DOM.select('#user-form').events('submit').pipe(
    tap((e: Event) => e.preventDefault()),
    map((e: Event): string => (e.target as HTMLFormElement).user.value),
    filter(user => !!user),
    map((user) => ({
      category: 'user',
      url: `https://api.github.com/users/${user}?access_token=${ACCESS_TOKEN}`,
      method: 'GET'
    }))
  )
  const DOM = sources.HTTP.select('user').pipe(
    map(http$ => http$.pipe(
      map(res => ({ data: res.body } as ResponseType)),
      catchError((err) => of({ error: String(err) } as ResponseType)),
    )),
    mergeAll(),
    startWith({} as ResponseType),
    map(({ data, error }) => (
      <div className='github'>
        { data && <table>
          { Object.entries(data).map(([key, value]: [string, any]) => <tr>
            <td>{key}</td>
            <td>{value}</td>
          </tr>) }
        </table> }
        { error && <i>{error}</i> }
        <form id='user-form'>
          <input name='user'></input>
          <button type='submit'>Search</button>
        </form>
      </div>
    ))
  )
  return {
    fetch: githubFetch$,
    DOM,
  }
}