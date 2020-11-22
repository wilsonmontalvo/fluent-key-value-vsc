# Fluent Key-Value for Visual Studio Code
Makes writing key-value code (like JSON) fluent, with a simple set of `snippets` and `productivity shortcuts`.

## Shortcuts as commands (beta)
Introduce JSON snippets by writing commands in the Command Palette: `Ctrl + Shift + P` then search for `Fluent Key-Value: Create JSON`.  
For this, the extension has it own "domain-specific language" (DSL) in order to speed up the snippets generation:  

|  Token  | Meaning       | Command example      | Example comments                                                    |
|:-------:|---------------|----------------------|---------------------------------------------------------------------|
|  `word` | Key or value  | language             | generates a pair with "language" key                                |
|   `o`   | Object        | o                    | generates an empty object                                           |
|   `a`   | Array         | a                    | generates an empty array                                            |
|   `,`   | Sibling       | language,path        | generates 02 pairs with the given keys                              |
| `[...]` | Value of pair | language[javascript] | generates a pair with "language" key, and "javascript" value        |
|   `>`   | Contains...   | o>language,path      | generates an object with 02 pairs with the given keys               |
|   `*`   | Repeater      | o>*2                 | generates an object with 02 empty pairs                             |
| `(...)` | Grouping      | (o>language,path)*2  | generates 02 equal items with the structure within the parentheses. |
|         |               |                      |                                                                     |

  
E.g: `o>containers[a>o>image[nginx],port[80]]` would generate this snippet:  

```javascript
{
  "containers": [
    {
      "image": "nginx",
      "port": 80
    }
  ]
}
```

Other command examples:  

- `language,path`  
- `isActive[true]`  
- `o>language,path`  
- `a>5,true,csharp`  
- `a>(o>language,path)*2`  
- `snippets[a>(o>language,path)*2]`  
- `o>spec[o>containers[a>(o>name[frontend],image[nginx],ports[a>o>containerPort[80]])*2]]`

## Snippets in Editor (typing)
Working with JSON config files:

![JSON snippet example](https://raw.githubusercontent.com/wilsonmontalvo/vsc-jsonsnippets/master/images/json-snippet-demo.gif)

Defining json-data in several programming languages (JavaScript, TypeScript, etc):

![JSON snippet example](https://raw.githubusercontent.com/wilsonmontalvo/vsc-jsonsnippets/master/images/json-snippet-js.gif)

### Snippets:

| Snippets | Content |
| -------: | --------|
| obj | Create a JSON object |
| objc | Create a JSON object ending with comma |
| arr | Create a JSON array |
| arrc | Create a JSON array ending with comma |
| pair | Create JSON key/value pair |
| pairc | Create JSON key/value pair ending with comma |
| paircln | Create JSON key/value pair ending with comma and jumping to next line. Not recommended for complex "value" |

### Productivity shortcuts in editor:

| Snippets | Content |
| -------: | --------|
| pair*2 | Create 02 pairs |
| pair*3 | Create 03 pairs |
| obj>1 | Create JSON object with 01 pair. |
| obj>2 | Create JSON object with 02 pairs. |
| obj>3 | Create JSON object with 03 pairs. |
| arr>1 | Create JSON array with 01 item. |
| arr>2 | Create JSON array with 02 items. |
| arr>3 | Create JSON array with 03 items. |

### Supported languages:

* JSON
* JavaScript
* TypeScript
* Other(s) to come...

## Applications:

* Write JSON in configuration files.
* Write JSON code embed in different programming languages (eg. jQuery ajax).
* Write any key/value pair style code in different programming languages.

## Extended functionality:
Other languages with key/value pair style code:

* C# : Anonymous types, Object initializer and Implicitly-typed Arrays in Object Initializers.
* Other(s) to come...

Visual Studio Marketplace: 
https://marketplace.visualstudio.com/items?itemName=wmontalvo.vsc-jsonsnippets