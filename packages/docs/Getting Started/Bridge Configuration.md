# Bridge Configuration

Using the User Interface you can set up multiple bridges and configure each to use different filters for your entities.
Each bridge will be completely independent of the others and uses its own port for matter.

> [!NOTE]
> You can use **one** bridge to connect to **multiple** controllers.
> See [this guide](../Guides/Connect%20Multiple%20Fabrics.md) for details how to set this up.

> [!WARNING]
> Alexa only supports port `5540`. Therefore, you cannot create multiple bridges to connect with Alexa.

Every bridge has to have a `name` (string), `port` (number) and `filter` (object) property. The filter property has to
include an `include` (array) and an `exclude` (array) property.

```json
{
  "name": "My Hub",
  "port": 5540,
  "filter": {
    "include": [],
    "exclude": []
  }
}
```

A include- or exclude-item is an object having a `type` and a `value` property.
The `type` can be one of:

- `pattern` - a pattern matching your entity ids
- `domain` - the domain you want to include or exclude
- `platform` - the integration you want to include or exclude
- `entity_category` -
  the [entity category](https://developers.home-assistant.io/docs/core/entity/#registry-properties) (`configuration` /
  `diagnostic`) you want to include or exclude
- `label` - the slug of a label you want to include or exclude
- `area` - the slug of an area you want to include or exclude

The `value` property is a string containing the corresponding value. You can add multiple include or exclude rules which
are then combined.
All entities which match one of the include-rules will be included, but all entities which match one of the exclude
rules will be excluded.

> [!WARNING]
> When performing changes on entities, like adding or removing a label, you need to refresh the matter-hub application
> for the changes to take effect (e.g. edit the bridge or restart the addon).

Example configuration:

```json
{
  "name": "My Hub",
  "port": 5540,
  "filter": {
    "include": [
      {
        "type": "label",
        "value": "my_voice_assist"
      },
      {
        "type": "pattern",
        "value": "light.awesome*"
      }
    ],
    "exclude": [
      {
        "type": "platform",
        "value": "hue"
      },
      {
        "type": "domain",
        "value": "fan"
      },
      {
        "type": "entity_category",
        "value": "diagnostic"
      }
    ]
  }
}
```

> [!WARNING]
>
> - Labels and areas in Home Assistant are technically represented by their "slugs".
> - Slugs are technical identifiers used in the background.
> - Slugs are always lowercase and only allow a-z and underscores, so everything else will be replaced with an `underscore`.

> - Even when renaming a label or area, the slug doesn't change. Never.
>
> You can retrieve the slug using the following templates in Home Assistant:
>
> - `{{ labels() }}` - returns all labels
> - `{{ labels("light.my_entity") }}` - returns the labels of a specific entity
> - `{{ areas() }}` - returns all areas
