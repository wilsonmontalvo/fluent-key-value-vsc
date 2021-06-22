<p>
  <a href="https://marketplace.visualstudio.com/items?itemName=wmontalvo.vsc-jsonsnippets">
    <img alt="VS Code Marketplace Version" src="https://vsmarketplacebadge.apphb.com/version/wmontalvo.vsc-jsonsnippets.svg">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=wmontalvo.vsc-jsonsnippets">
    <img alt="VS Code Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/i/wmontalvo.vsc-jsonsnippets">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=wmontalvo.vsc-jsonsnippets">
    <img alt="VS Code Marketplace Rating" src="https://vsmarketplacebadge.apphb.com/rating-short/wmontalvo.vsc-jsonsnippets.svg">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=wmontalvo.vsc-jsonsnippets">
    <img alt="VS Code Marketplace Downloads" src="https://img.shields.io/visual-studio-marketplace/d/wmontalvo.vsc-jsonsnippets">
  </a>
</p>

Makes writing key-value code (like JSON) fluent, with a simple set of `snippets` and `productivity shortcuts`.  

## Snippets
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

### Productivity shortcuts:

| Snippets | Content |
| -------: | --------|
| pairo | Create pair with object value |
| paira | Create pair with array value |
| pair*2 | Create 02 pairs |
| pair*3 | Create 03 pairs |
| obj>1 | Create JSON object with 01 pair. |
| obj>2 | Create JSON object with 02 pairs. |
| obj>3 | Create JSON object with 03 pairs. |
| arr>1 | Create JSON array with 01 item. |
| arr>2 | Create JSON array with 02 items. |
| arr>3 | Create JSON array with 03 items. |


## Shortcuts as commands (beta)
Speed up writing JSON by running commands in the Command Palette: `Ctrl + Shift + P` then search for:  

- Fluent Key-Value: Create JSON  
- Fluent Key-Value: Create YAML  

E.g: this command `o>containers[a>(o>image,port[80])*2]` would generate these snippets:  

For JSON:  
```javascript
{
  "containers": [
    {
      "image": ,
      "port": 80
    },
    {
      "image": ,
      "port": 80
    }
  ]
}
``` 

For YAML:  
```javascript
  containers:
  - image: 
    port: 80
  - image: 
    port: 80
``` 
For this, the extension has it own "domain-specific language (DSL)".  

|  Token    | Meaning        | Comments                                                          |
|:---------:|----------------|-------------------------------------------------------------------|
|  `word`   | Key or value   | Keys are always string. Values can be string, boolean, number.    |
|   `o`     | Object         |                                                                   |
|   `a`     | Array          |                                                                   |
|   `,`     | Sibling        | Applies to pairs and objects.                                     |
| `[...]`   | Value of pair  | E.g `language[javascript]`.                                       |
|   `>`     | Contains...    | Only objects and arrays can "contain something".                  |
|   `*`     | Repeater       | Syntax `[item]*N`. Repeats 'item', 'N' times. E.g `o*3`           |
| `(...)`   | Grouping       | For assigning siblings or repeating.  E.g `(o>language,path)*2`   |
|           |                |                                                                   |

### Command examples:  
- `language`  
- `isActive[true]`  
- `a>5,true,csharp`  
- `name,image,path`  
- `name,image[nginx]`  
- `*5`  
- `o>*2`  
- `o>language,path`  
- `a>(o>language,path)*2`  
- `snippets[a>(o>language,path)*2]`  
- `o>spec[o>containers[a>(o>name[frontend],image[nginx],ports[a>o>containerPort[80],name])*2]]`

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