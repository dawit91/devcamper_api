const advancedResults = (model, populate) => async (req, res, next) => {
    let query;
    let reqQuery = { ...query}
    const removeFields = ['select', 'sort', 'page', 'limit']
    

    let queryStr = JSON.stringify(reqQuery)
    removeFields.forEach( field => delete(reqQuery.field))
    queryStr = queryStr.replace(/\b(lt|lte|gt|gte|in)\b/g, match => `$${match}`)

    query = model.find(JSON.parse(queryStr))

    //filter
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    // sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    }
    else {
        query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit)

    //Pagination
    const pagination = {}
    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    //populate
    query = query.populate(populate)

    const results = await query

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
}

module.exports = advancedResults