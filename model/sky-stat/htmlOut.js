/* global $ */

module.exports = {
  outHtml
}

function outHtml (htmlTitle, arr, chart = false, onlyChart = false) {
  let redColor = '#f5222d'
  let greenColor = '#52c41a'
  let yellowColor = '#faad14'
  let body = ``
  let script = ``
  $.log(arr)
  for (let i = 0; i < arr.length; i++) {
    const { dataTitleArr, dataArr, title, chartData } = arr[i]
    let trTitle = ''
    let tBody = ''
    try {
      trTitle = dataTitleArr
        .map(k => {
          return `<th title="${k}">${k}</th>`
        })
        .join('')
      tBody = dataArr
        .map(item => {
          let td = item
            .map((v, idx) => {
              let colorStr = ''
              if (['min', 'max', 'avg'].includes(dataTitleArr[idx])) {
                let v1 = +v.replace('ms', '')
                if ((v1 > 0) & (v1 <= 60))
                  colorStr = `style="color:${greenColor}"`
                if ((v1 > 60) & (v1 <= 200))
                  colorStr = `style="color:${yellowColor}"`
                if (v1 > 200) colorStr = `style="color:${redColor}"`
              }
              return `<td ${colorStr}>${v}</td>`
            })
            .join('')
          return `<tr>${td}</tr>`
        })
        .join('')
    } catch (e) {
      $.err(e.stack)
    }
    if (!onlyChart) {
      body += `
    <details ${chart ? '' : 'open'}>
    <summary><font size="5">${title}列表</font></summary>
      <table class="gridtable">
        <thead>
          <tr>${trTitle}</tr>
        </thead>
        <tbody>${tBody}</tbody>
      </table>
    </details>`
    }
    if (chart) {
      let maxColor = '216, 112, 147'
      let minColor = '60, 179, 113'
      let avgColor = '255, 165, 0'
      body += `
        <details open>
        <summary><font size="5">${title} 图表</font></summary>

        <span style="padding:2px;background-color:rgb(${maxColor})">max</span>
        <span style="padding:2px;background-color:rgb(${minColor})">min</span>
        <span style="padding:2px;background-color:rgb(${avgColor})">avg</span>
        <br>

        <canvas id="${chartData[0].id}"></canvas>

        <br><span style="padding:2px;background-color:rgb(151,187,205)">count</span><br>
        <canvas id="${chartData[1].id}"></canvas>
        </details>`
      script += `
ctx = document.getElementById('${chartData[0].id}').getContext('2d')
arrData = [${JSON.stringify(chartData[0].data)},${JSON.stringify(
        chartData[1].data
      )},${JSON.stringify(chartData[2].data)}]
colorList =['${maxColor}','${minColor}','${avgColor}']
data = getData(${JSON.stringify(chartData[0].label)}, arrData, 3, colorList)
new Chart(ctx).Line(data)

ctx = document.getElementById('${chartData[1].id}').getContext('2d')
data = getData(${JSON.stringify(chartData[0].label)}, ${JSON.stringify(
        chartData[3].data
      )})
new Chart(ctx).Line(data)
        `
    }
  }

  return `<!DOCTYPE html>
<html lang="zh-ch">
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" />
<head>
${
  chart
    ? `<script src="https://cdn.bootcss.com/Chart.js/1.0.2/Chart.min.js"></script>`
    : ''
}
  <meta charset="utf-8"><title>${htmlTitle}</title>
    <style type="text/css">
        canvas {width: 90%;height: 300px;}
        table.gridtable {
            font-family: verdana,arial,sans-serif;
            font-size:11px;
            color:#333333;
            border-width: 1px;
            border-color: #666666;
            border-collapse: collapse;
        }
        table.gridtable th {
            border-width: 1px;
            padding: 8px;
            border-style: solid;
            border-color: #666666;
            background-color: #dedede;
        }
        table.gridtable td {
            text-align: right;
            border-width: 1px;
            padding: 8px;
            border-style: solid;
            border-color: #666666;
            background-color: #ffffff;
        }
    </style>
</head>
<body>${body}</body>
<script>
let ctx;
let data;
let arrData;
let colorList;
${script}
function getData (labelsArr, dataList, len = 1, colorList = []) {
  if (len === 1) {
    return {
      labels: labelsArr,
      datasets: [{
        label: 'My Second dataset',
        fillColor: 'rgba(151,187,205,0.2)',
        strokeColor: 'rgba(151,187,205,1)',
        pointColor: 'rgba(151,187,205,1)',
        pointStrokeColor: '##FF0000',
        pointHighlightFill: '##FF0000',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data: dataList
      }]
    }
  }

  let data = {
    labels: labelsArr,
    datasets: []
  }
  for (let i = 0; i < len; i++) {
    data.datasets.push({
      label: 'My Second dataset',
      fillColor: 'rgba('+colorList[i]+',0.2)',
      strokeColor: 'rgba('+colorList[i]+',1)',
      pointColor: 'rgba('+colorList[i]+',1)',
      pointStrokeColor: '##FF0000',
      pointHighlightFill: '##FF0000',
      pointHighlightStroke: 'rgba('+colorList[i]+',1)',
      data: dataList[i]
    })
  }
  return data
}
</script>
</html>`
}
