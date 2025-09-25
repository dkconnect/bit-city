<div align="center">

# Bit Dot Night

## Generative Pixel Cityscape

**Bit Dot Night** is a unique generative art piece that creates an infinite, animated cityscape using **bitwise operations** and a seeded pseudo-random number generator. It combines a retro, pixel-art aesthetic with complex mathematical logic to create a diverse array of digital metropolises.

<table align="center">
    <thead>
        <tr>
            <th>Trait</th>
            <th>Example Values</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Window Operator</td>
            <td>XOR, AND, OR, Addition, Multiplication</td>
        </tr>
        <tr>
            <td>Background Operator</td>
            <td>XOR, AND, OR, Division/Reciprocal</td>
        </tr>
        <tr>
            <td>Palette</td>
            <td>Grayscale, Rainbow, Shifted Hue</td>
        </tr>
        <tr>
            <td>Atmospherics</td>
            <td>Earthquake, Inverted Colors, Thin Buildings, Many Moons</td>
        </tr>
    </tbody>
</table>

</div>

<div align="center">

### Generated Output

![My Best Generation](bit-dot-city-20250713-201426.png)

### Traits Showcase

<table width="100%" align="center">
  <tr>
    <td align="center">
      <img src="bit-dot-city-20250713-200212.png" alt="Grayscale City Trait" width="250"/>
      <br>
      <sub><b>Grayscale Palette</b></sub>
    </td>
    <td align="center">
      <img src="bit-dot-city-20250713-201438.png" alt="Grayscale City Trait" width="250"/>
      <br>
      <sub><b>Rainbow Palette</b></sub>
    </td>
    <td align="center">
      <img src="bit-dot-city-20250713-200218.png" alt="Grayscale City Trait" width="250"/>
      <br>
      <sub><b>Different Palette</b></sub>
    </td>
  </tr>
</table>

</div>

---

<div align="center">

## The Logic and Math Explained

The core of "Bit Dot Night" lies in its use of a **seeded random number generator** and custom **bitwise arithmetic** to create highly structured yet non-repeating patterns.

### 1. Seeding and Reproducibility

The project uses an FxHash-compatible seeding mechanism (`fxhash`, `b58dec`, `sfc32` functions) to ensure that every generated artwork is **unique and reproducible**.

* **`fxrand()`:** A custom pseudo-random number generator (PRNG) is initialized with the seed.
* **`random` Class:** A wrapper class uses the seed to provide consistent random values (integers, floats, booleans) for setting the initial parameters (e.g., number of moons, color palette, operator types).

### 2. The Operators (Bitwise Math)

The visual structure of the sky and the window patterns of the buildings are determined by a randomized mathematical operation applied to the pixel coordinates.

The static method `ArtGenerator.applyOperator(operator, x, y, seedX, seedY)` takes the coordinates (`x`, `y`) and offsets them by two randomized seeds (`seedX`, `seedY`). The resulting values (`X` and `Y`) are then combined using one of seven functions:

<table align="center">
    <thead>
        <tr>
            <th>Operator ID</th>
            <th>Function</th>
            <th>Explanation</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>0</td>
            <td>X & Y</td>
            <td>Bitwise AND: Results in a pattern that emphasizes overlapping binary structures.</td>
        </tr>
        <tr>
            <td>1</td>
            <td>X | Y</td>
            <td>Bitwise OR: Creates a denser, more connected pattern.</td>
        </tr>
        <tr>
            <td>2</td>
            <td>X ^ Y</td>
            <td>Bitwise XOR: Creates a repeating, checkerboard-like structure, ideal for abstract window patterns.</td>
        </tr>
        <tr>
            <td>3</td>
            <td>X + Y</td>
            <td>Addition: A simple arithmetic operator creating linear gradients.</td>
        </tr>
        <tr>
            <td>4</td>
            <td>X * Y</td>
            <td>Multiplication: Creates rapid-changing patterns based on the product of coordinates.</td>
        </tr>
        <tr>
            <td>5</td>
            <td>X/Y + Y/X</td>
            <td>Division/Reciprocal: Introduces complex, concentric shapes.</td>
        </tr>
        <tr>
            <td>6</td>
            <td>(X - Y) ^ (X + Y)</td>
            <td>Complex Bitwise: A combination of arithmetic and bitwise operations for chaotic results.</td>
        </tr>
    </tbody>
</table>

The result of this operation is fed into a cosine function (`Math.cos(o * seedScale)`) to generate a smooth, wave-like **brightness** value, which determines the final color.

### 3. Infinite Generation

The cityscape is animated using an `update()` loop (`requestAnimationFrame`). Instead of drawing the entire scene repeatedly, the logic focuses on drawing **one building** at a time, ensuring a constant, fresh generation of new elements rising from the bottom of the canvas.

* The vertical position (`Y`) of each building is calculated based on the animation **time** (`t`) and a randomized **rooms per second** parameter, giving the illusion of continuous upward movement.

</div>

---

<div align="center">

## Implementation Details

### File Structure

* `index.html`: The main page structure, loading dependencies (Tailwind, Font Awesome).
* `style.css`: Custom CSS for layout, dark theme, button styling, and **pixel-perfect rendering** (`image-rendering: pixelated;`).
* `script.js`: The core generative logic, seeding, parameters, and drawing functions.

### Canvas Usage

1.  **Offscreen Canvas (High-Res):** A `4096 x 2048` canvas is used for all drawing operations (`this.offscreenCanvas`). This ensures that the generated image, when downloaded, is a high-resolution version, regardless of the user's screen size.
2.  **Main Canvas (Display):** The visible canvas (`#pixelArtCanvas`) scales the high-resolution image down to fit the screen.

</div>
