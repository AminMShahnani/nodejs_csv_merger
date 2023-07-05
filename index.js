const { readCSV, readDirectory, readSourcesNames, generateCSV } = require('./src/utils/fileHandler')
const asyncForEach = require('./src/utils/asyncForEach')
const CatalogModel = require('./src/models/CatalogModel')


// 1. Read csv files
const readFileStep = async () => {
    const fileNames = await readDirectory('./input')
    const sources = readSourcesNames(fileNames)
    const data = []
    await asyncForEach(sources, async (sourceName) => {
        data[sourceName]= []
        data[sourceName].catalog = await readCSV(`./input/catalog${sourceName}.csv`)
        data[sourceName].suppliers = await readCSV(`./input/suppliers${sourceName}.csv`)
        data[sourceName].barcodes = await readCSV(`./input/barcodes${sourceName}.csv`)
    })
    return data
}


// 2. Process file and merge Products
const processMergeStep = async (data) => {
    const catalogObj = new CatalogModel()
    await asyncForEach(Object.keys(data), async (catalogSourceName) => {
        await catalogObj.addProducts(data[catalogSourceName])
    })
    return catalogObj
}



// 3. Generate output file

const runApp = async () => {
    // 1. Read csv files
    const data = await readFileStep()

    // 2. Process file and merge Products
    const mergedResult = await processMergeStep(data)
    console.log('mergedResult', mergedResult)
    
    // 3. Generate output file
    generateCSV(mergedResult.products)
}

runApp()
