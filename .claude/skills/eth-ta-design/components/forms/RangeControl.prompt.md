Slider control for interactive visualisation parameters — label + italic math symbol on the left, live mono value on the right, hairline-thin track.

```jsx
<RangeControl label="Damping ratio" symbol="ζ" value={0.5} min={0} max={2} step={0.01} onChange={setZeta} />
```

Copied from the source site's second-order step-response demo (`.ctrl` / `input[type=range]`) — the template every future interactive demo should reuse.
