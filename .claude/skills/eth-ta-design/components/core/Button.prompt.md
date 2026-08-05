A mono-label pill button for the rare cases the site needs an explicit action (the source site mostly uses bare links and hover rows instead).

```jsx
<Button variant="accent" size="md" onClick={submit}>Submit</Button>
```

Variants: `primary` (ink fill), `accent` (accent-blue fill), `ghost` (outline, accent border on hover), `text` (bare mono link, no border). Sizes: `sm` / `md` / `lg`. Intentional addition — the source site has no explicit button component; this generalizes its pill/tag visual language for interactive UI kit work.
