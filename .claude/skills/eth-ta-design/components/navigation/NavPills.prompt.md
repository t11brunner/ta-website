Top-level section switcher: mono uppercase labels in a row bounded by two hairlines, current item gets an accent pill.

```jsx
<NavPills items={[{key:'weeks',label:'weeks'},{key:'viz',label:'visualisations'}]} active="weeks" onChange={setScreen} />
```

Matches the source site's `nav.main` exactly — the only navigation pattern the site uses (no sidebar, no tabs-with-underline).
