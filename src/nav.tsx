import { DOMSource } from '@cycle/dom/lib/cjs/rxjs'
import { Location } from '@cycle/history'
import { Observable } from 'rxjs'
import { tap, map, take, concat, distinctUntilChanged, skip } from 'rxjs/operators'

export default function main(
  sources: {
    history: Observable<Location>
    DOM: DOMSource
  }
) {
  const nav$ = sources.DOM.select('nav a').events('click').pipe(
    tap((e: Event) => e.preventDefault()),
    map((e: Event) => (e.target as HTMLAnchorElement).pathname)
  )
  const DOM = sources.history.pipe(
    map(location => (
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
    ))
  )
  
  return {
    DOM,
    history: sources.history.pipe(
      map(location => location.pathname),
      take(1),
      concat(nav$),
      distinctUntilChanged(),
      skip(1)
    )
  }
}