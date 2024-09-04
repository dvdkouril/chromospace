# Scripts for converting data to Arrow

## Usage:
Good to make a new directory for the generated files:
```
mkdir out
```

Then run the script using [deno](https://deno.com) (needs to be [installed first](https://docs.deno.com/runtime/#install-deno)):
```
deno task convert <input-filename> out/<output-filename>.arrow <filetype>
```
`<filetype>` can be `xyz`, `pdb`, `tsv`, or `3dg`.

Example:
```
deno task convert model.pdb out/model.arrow pdb
```
