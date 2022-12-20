# Spec Support chart

See https://swagger.io/specification/#schema-object for support of schema parts

The following chart shows the support of the spec:

| Field name           | Supported | Planned | Description                                                                                                                                     |
| -------------------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| title                | -         | yes     | Used for documentation                                                                                                                          |
| multipleOf           | -         | yes     |                                                                                                                                                 |
| maximum              | -         | yes     |                                                                                                                                                 |
| exclusiveMaximum     | -         | yes     |                                                                                                                                                 |
| minimum              | -         | yes     |                                                                                                                                                 |
| exclusiveMinimum     | -         | yes     |                                                                                                                                                 |
| maxLength            | -         | yes     |                                                                                                                                                 |
| minLength            | -         | yes     |                                                                                                                                                 |
| pattern              | -         | yes     |                                                                                                                                                 |
| maxItems             | -         | yes     |                                                                                                                                                 |
| minItems             | -         | yes     |                                                                                                                                                 |
| uniqueItems          | -         | yes     |                                                                                                                                                 |
| maxProperties        | -         | yes     |                                                                                                                                                 |
| minProperties        | -         | yes     |                                                                                                                                                 |
| required             | yes       | yes     |                                                                                                                                                 |
| enum                 | -         | yes     |                                                                                                                                                 |
| type                 | partial   | yes     | Parsed in [importModel](../../model/model.ts)                                                                                                   |
| allOf                | yes       | yes     | Implemented in the [allOf](./all-of.ts) handler                                                                                                 |
| oneOf                | partial   | yes     | Implemented in [oneOf](./one-of.ts) handler. Also see discriminator. **TODOS**: <br/> ❌ Schema validation is missing, so it behaves like anyOf |
| anyOf                | yes       | yes     | Implemented in the [anyOf](./any-of.ts) handler                                                                                                 |
| not                  | yes       | yes     | Implemented in the [not](./not.ts) handler.                                                                                                     |
| items                | -         | yes     |                                                                                                                                                 |
| properties           | yes       | yes     | The [Object Types](object-types.ts) parser handles objects with properties                                                                      |
| additionalProperties | -         | yes     |                                                                                                                                                 |
| description          | -         | yes     | Used for documentation                                                                                                                          |
| format               | -         | yes     | date format                                                                                                                                     |
| default              | -         | yes     |                                                                                                                                                 |
| nullable             | -         | yes     |                                                                                                                                                 |
| discriminator        | -         | yes     |                                                                                                                                                 |
| readOnly             | -         | yes     |                                                                                                                                                 |
| writeOnly            | -         | yes     |                                                                                                                                                 |
| xml                  | -         | yes     |                                                                                                                                                 |
| externalDocs         | -         | yes     |                                                                                                                                                 |
| example              | -         | yes     |                                                                                                                                                 |
| deprecated           | -         | yes     |                                                                                                                                                 |
