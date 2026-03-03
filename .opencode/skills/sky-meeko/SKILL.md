---
name: sky-meeko
description: Meeko是skybase框架的核心工具库，提供了丰富的JavaScript工具函数，包括数学计算、数据处理、类型检查、参数校验等功能。
---

# Sky-Meeko Utility Library Skill

## Overview

Meeko是skybase框架的核心工具库，提供了丰富的JavaScript工具函数，包括数学计算、数据处理、类型检查、参数校验等功能。

## Basic Usage

```javascript
const $ = require('meeko')
```

## Core Modules

### 1. tools Module

#### Type Checking Functions
```javascript
$.tools.isObj(o)        // Check if object
$.tools.isObject(o)     // Alias for isObj
$.tools.isString(o)     // Check if string
$.tools.isNumber(o)     // Check if number
$.tools.isBigInt(o)     // Check if BigInt
$.tools.isArray(o)      // Check if array
$.tools.isNull(o)       // Check if null
$.tools.isUndefined(o)  // Check if undefined
$.tools.isRegExp(o)     // Check if RegExp
$.tools.isBoolean(o)    // Check if boolean
$.tools.isDate(o)       // Check if Date
```

#### Number Validation Functions
```javascript
$.tools.isPInt(o)       // Check if positive integer
$.tools.isNInt(o)       // Check if negative integer
$.tools.isInt(o)        // Check if integer
$.tools.isDecimal(o)    // Check if decimal
$.tools.isBool(s)       // Check if boolean-like (0,1,true,false)
```

#### Parameter Validation (checkParam)
```javascript
// Parameter validation is core to API definitions
const result = $.tools.checkParam({
  id: 2
}, {
  id: {
    desc: 'id',
    req: 1,           // Required: 0=no, 1=yes
    type: 'int',      // Type: int/string/datetime/file/enum/bool/number/array/object
    def: null,        // Default value
    size: [-1, 1]     // Range limit (numeric) / length limit (string)
  }
})
// Returns: { code: 200, msg: '', data: { id: 2 } }
```

**Supported Parameter Types:**
- `int` - Integer type
- `positive` - Positive integer
- `negative` - Negative integer
- `string` - String (auto trim)
- `datetime` - DateTime
- `file` - File type (requires size/fileType)
- `enum` - Enum type (requires size array)
- `bool` - Boolean type
- `number` - Number type
- `array` - Array type (can specify items)
- `object` - Object type

#### Other Utility Functions
```javascript
$.tools.size(val)               // Get length of object/array/string
$.tools.equals(x, y)            // Deep compare two objects
$.tools.getType(o)              // Get data type
$.tools.ifObjEmpty(o, ex)       // Check if object is empty
$.tools.jsonPack(obj, order)    // Merge array object properties
$.tools.copy(o)                 // Deep copy
$.tools.uuid(len, radix)        // Generate UUID
$.tools.wait(t)                 // Promise delay t milliseconds
$.tools.race(fn, timeout, errorObj)  // Promise race
$.tools.hash(str, m, enCode)    // Hash calculation (default sha1)
$.tools.timeAgo(t1, t2, lng)    // Time difference in Chinese
```

### 2. Console Color Output ($.c)
```javascript
// Basic colors
$.c.r('Red text')       // Red
$.c.g('Green text')     // Green
$.c.y('Yellow text')    // Yellow
$.c.b('Blue text')      // Blue
$.c.m('Magenta text')   // Magenta
$.c.c('Cyan text')      // Cyan
$.c.w('White text')     // White

// Dim colors
$.c.dimr('Dim red')
$.c.dimg('Dim green')

// Cursor positioning
$.c.xy(x, y)
$.c.cls                 // Clear screen
```

### 3. Math Module ($.math)
```javascript
// Basic math
$.math.max(arr)         // Maximum
$.math.min(arr)         // Minimum
$.math.sum(arr)         // Sum
$.math.mean(arr)        // Mean
$.math.median(arr)      // Median
$.math.mode(arr)        // Mode
$.math.variance(arr)    // Variance
$.math.stddev(arr)      // Standard deviation

// Matrix operations
$.math.matrix           // Matrix operations
$.math.evd              // Eigenvalue decomposition
$.math.svd              // Singular value decomposition
$.math.pca              // Principal component analysis

// Machine learning
$.math.ml.Knn           // K-nearest neighbors
$.math.ml.NaiveBayes    // Naive Bayes
$.math.ml.DecisionTree  // Decision tree
```

### 4. Data Processing Module

#### Array Extensions ($.array)
```javascript
const arr = [1, 2, 3, 4, 5]
arr.unique()            // Remove duplicates
arr.count()             // Count elements
arr.countAdv()          // Advanced counting
arr.orderBy(keys, orders)  // Multi-field sort
arr.groupBy(key)        // Group by key
```

#### String Extensions ($.string)
```javascript
const str = 'hello world'
str.camelize()          // CamelCase
str.deCamelize(sep)     // CamelCase to separator
str.fillStr(char, len)  // Fill character
str.len()               // Unicode length
str.toLow()             // To lowercase
str.toUp()              // To uppercase
```

#### Date Extensions ($.date)
```javascript
const date = new Date()
date.date2Str()         // To string YYYY-MM-DD hh:mm:ss
date.add(n, type)       // Date add/subtract
Date.getDaysOfMonth(y, m)  // Get days in month
```

#### Number Extensions ($.number)
```javascript
const num = 1234567.89
num.prettyBytes()       // Format bytes
num.padStart(len, char) // Pad start
num.padEnd(len, char)   // Pad end
```

### 5. Other Utility Modules

#### Mock Data ($.Mock)
```javascript
const mock = $.Mock.mock({
  'list|1-10': [{
    'id|+1': 1,
    'name': '@cname',
    'age|18-60': 1
  }]
})
```

#### Template Engine ($.tpl)
```javascript
const template = 'Hello {{name}}!'
const result = $.tpl(template, { name: 'World' })
```

#### Snowflake Algorithm ($.Snowflake)
```javascript
const snowflake = new $.Snowflake(workerId, datacenterId)
const id = snowflake.nextId()
```

#### File Operations ($.file)
```javascript
$.file.read(path)       // Read file
$.file.write(path, data) // Write file
$.file.exists(path)     // Check existence
$.file.mkdir(path)      // Create directory
```

#### Regex Tools ($.reg)
```javascript
$.reg.email             // Email regex
$.reg.mobile            // Mobile phone regex
$.reg.url               // URL regex
$.reg.idCard            // ID card regex
```

#### QR Code ($.qrcode)
```javascript
$.qrcode.gen(text, options)  // Generate QR code
```

#### Geo Location ($.geo)
```javascript
$.geo.distance(lat1, lng1, lat2, lng2)  // Calculate distance
$.geo.inPolygon(point, polygon)         // Check if point in polygon
```

#### Crypto Extensions ($.Crypto)
```javascript
$.Crypto.md5(str)
$.Crypto.sha1(str)
$.Crypto.sha256(str)
$.Crypto.base64(str)
$.Crypto.aes(str, key)
```

### 6. Global Utility Functions
```javascript
$.compare(k, order)     // Array sort comparison function
$.wait(t)               // Promise delay
$.pipe(...funcs)        // Function pipeline
$.json.parse(s)         // JSON parse (supports unquoted keys)
$.json.stringify(obj)   // JSON stringify
$.now()                 // Current time
$.to(promise)           // Promise to [err, data]
$.drawTable(data, colWidth, opt)  // Console table
$.bench(fn, n)          // Performance benchmark
```

### 7. Logging Output
```javascript
$.log(...args)          // Normal log
$.err(...args)          // Error log
$.dir(obj)              // Object expansion
$.option.logTime = true // Show timestamp
```

## Best Practices

1. **Prefer meeko utility functions** over native JS methods
2. **Parameter validation** use `$.tools.checkParam` to ensure API security
3. **Type checking** use `$.tools.isXXX` series functions
4. **Date handling** use `$.date` extension methods
5. **Math calculations** prefer `$.math` module
6. **Console output** use `$.c` color functions for better readability
