const axios = require('axios');
const filters = require('./filters');
const item = require('./item');
const utils = require('./utils');
const regions = require('./../const/regions.json');
const departments = require('./../const/departments.json');
const categories = require('./../const/categories.json');
const subcategories = require('./../const/subcategories.json');
const _ = require('lodash');
const { times } = require('lodash');

module.exports = class Search {
  constructor(options) {
    this.sort = options.sort || null;
    this.query = null;
    this.filter = filters.ALL;
    this.shouldbe = '';
    this.category = null;
    this.urgencyOnly = false;
    this.titleOnly = false;
    this.region = null;
    this.department = null;
    this.location = null;
    this.area = null;
    this.page = 1;
    this.limit = 35;
    this.searchAttributes = [];
    this.init(options);
  }

  init(options) {
    this.setCategory(options.category);
    this.setQuery(options.query);
    this.setFilter(options.filter);
    this.setCategory(options.category);
    this.setShouldbe(options.shouldbe);
    this.setUrgencyOnly(options.urgencyOnly);
    this.setTitleOnly(options.titleOnly);
    this.setRegion(options.region);
    this.setDepartment(options.department);
    this.setLocation(options.location);
    this.setArea(options.area);
    this.setPage(options.page);
    this.setLimit(options.limit);
  }

  setQuery(query) {
    if (query) {
      this.query = query;
    }
    return this;
  }

  setFilter(filter) {
    if (filter instanceof filters.Filter) {
      this.filter = filter;
    }
    return this;
  }

  setShouldbe(shouldbe) {
    if (shouldbe) {
      this.shouldbe = shouldbe;
    }
    return this;
  }

  setUrgencyOnly(urgencyOnly) {
    if (urgencyOnly == true || urgencyOnly == false) {
      this.urgencyOnly = urgencyOnly;
    }
    return this;
  }

  setTitleOnly(titleOnly) {
    if (titleOnly == true || titleOnly == false) {
      this.titleOnly = titleOnly;
    }
    return this;
  }

  setRegion(region) {
    if (region) {
      if (isNaN(region)) {
        var filteredRegion = _(regions)
          .filter((r) => r.channel === region)
          .value()[0];

        if (filteredRegion) {
          this.region = filteredRegion.id;
        }
      } else {
        this.region = region;
      }
    }
    return this;
  }

  setDepartment(department) {
    if (department) {
      if (isNaN(department)) {
        var filteredDepartments = _(departments)
          .filter((r) => r.channel === department)
          .value()[0];

        if (filteredDepartments) {
          this.department = filteredDepartments.id;
        }
      } else {
        this.department = department;
      }
    }
    return this;
  }

  setLocation(location) {
    if (location) {
      this.location = location;
    }
    return this;
  }

  setArea(area) {
    if (area) {
      this.area = area;
    }
    return this;
  }

  setCategory(category) {
    if (category) {
      if (isNaN(category)) {
        const filteredCategory = categories.reduce((accum, cat) => {
          const findedCat = cat.subcategories.find(
            (subCat) => subCat.channel === category
          );
          if (findedCat) {
            return {
              ...accum,
              ...findedCat
            };
          }
          return accum;
        }, {});

        if (filteredCategory) {
          console.log('filtered', filteredCategory);
          this.category = filteredCategory.id;
        }
      } else {
        this.category = category;
      }
    }
  }

  setPage(page) {
    if (parseInt(page) == page) {
      this.page = page;
    }
    return this;
  }

  setLimit(limit) {
    if (parseInt(limit) == limit) {
      this.limit = limit;
    }
    return this;
  }

  /**
   * Add a search extra element (specific to category)
   * @param {String} key   The name of search extra
   * @param {Object} value The value of search extra
   */
  addSearchAttributes(key, values) {
    if (key && values.length > 0) {
      this.searchAttributes[key] = values;
    }
    return this;
  }

  setCubicCapacity(value) {
    this.addSearchExtra('cubic_capacity', value);
    return this;
  }

  setRegDate(value) {
    this.addSearchExtra('regdate', value);
    return this;
  }

  setMileAge(value) {
    this.addSearchExtra('mileage', value);
    return this;
  }

  getIdsForLabels(search, currentCategoryId, key) {
    search = search.map((searchLabel) => {
      if (typeof searchLabel == 'string' && isNaN(parseInt(searchLabel))) {
        var searchId = _(subcategories[currentCategoryId][key].values)
          .filter((value) => value.label == searchLabel)
          .value();
        searchLabel = searchId[0].value;
      }
      return searchLabel;
    });
    return search;
  }

  getSubCategoriesRanges(currentCategoryId, searchExtras) {
    var ranges = {};
    _(searchExtras).forEach((search, key) => {
      if (currentCategoryId) {
        if (_(Object.keys(subcategories[currentCategoryId])).includes(key)) {
          // console.log(key, 'is a part of sub categories');
          if (typeof search === 'object' && !search.length) {
            // console.log('Sub category found is considered as a range');
            ranges[key] = search;
          }
        }
      }
    });

    // console.info('End of Parsing sub categories');
    return ranges;
  }

  getSubCategoriesExtras(currentCategoryId, searchAttributes) {
    var enums = { ad_type: ['offer'] };
    // atribute => { type: "price", values: {min: 50, max: 1000}}
    // or atribute => { type: "velo", values: ['course']}
    searchAttributes.forEach((attribute) => {
      const subCategorie = subcategories[currentCategoryId];
      console.log(subCategorie);
      const { values, type } = attribute;
      if (currentCategoryId) {
        if (Object.keys(subCategorie).includes(type)) {
          if (values.length) {
            // console.log('Sub category found is considered as an enum');

            // If search is a label, Get id of search label into related sub category
            attribute = this.getIdsForLabels(
              attribute,
              currentCategoryId,
              type
            );

            enums[type] = attribute;
          }
        }
      }
    });

    // console.info('End of Parsing sub categories');
    return enums;
  }

  getLocation(region, department, city_zipcodes, area) {
    var location = {};

    if (area) {
      location.area = area;
    }

    if (region) {
      location.region = region;
    }

    if (department) {
      location.department = department;
    }

    if (city_zipcodes) {
      location.city_zipcodes = city_zipcodes;
    }

    return location;
  }

  getKeywords(keywords, titleOnly) {
    var result = keywords ? { text: keywords } : {};
    if (titleOnly) {
      result.type = 'subject';
    }
    return result;
  }

  getBodyParams() {
    return {
      limit: this.limit,
      filters: {
        category: { id: this.category },
        enums: this.getSubCategoriesExtras(
          this.category,
          this.searchAttributes
        ),
        location: this.getLocation(
          this.region,
          this.department,
          this.location,
          this.area
        ),
        keywords: this.getKeywords(this.query, this.titleOnly),
        ranges: this.getSubCategoriesRanges(this.category, this.searchExtras)
      },
      offset: (this.page - 1) * this.limit,
      owner_type: this.filter == filters.ALL ? null : this.filter.value,
      sort_by:
        this.sort == null
          ? null
          : this.sort.sort_by == null
          ? null
          : this.sort.sort_by,
      sort_order:
        this.sort == null
          ? null
          : this.sort.sort_order == null
          ? null
          : this.sort.sort_order
    };
  }

  parseData(data) {
    var output = [];

    for (var i in data) {
      var entry = data[i];

      var attributes = {};

      if (entry.attributes != null) {
        entry.attributes.forEach((attribute) => {
          attributes[attribute.key] = attribute.value;
        });
      }

      var parisGMT = utils.getParisGMT();

      output.push(
        new item.Item({
          title: entry.subject,
          description: entry.body,
          category: entry.category_name,
          link: entry.url,
          images: entry.images.urls,
          location: entry.location,
          urgent: entry.urgent ? entry.urgent : false,
          price: entry.price ? entry.price[0] : 0,
          date: new Date(entry.first_publication_date + ' ' + parisGMT),
          date_index: new Date(entry.index_date + ' ' + parisGMT),
          owner: entry.owner,
          attributes: attributes
        })
      );
    }

    return output;
  }


  run(bodyParams) {
    var self = this;
    bodyParams = bodyParams || this.getBodyParams();
    axios({
      method: 'post',
      url: 'https://api.leboncoin.fr/finder/search',
      data: bodyParams,
      gzip: true,
      type: 'search'
    }).then((response) => {
      if (response) {
        const ads = parseData(response.data.ads);
        const output = {
          page: self.page,
          pages: Math.ceil(response.data.total / self.limit),
          nbResult: ads.length,
          results: ads
        };
        return output;
      }
    });

    //   return new Promise(function (resolve, reject) {
    //     axios.post(
    //       {
    //         uri: 'https://api.leboncoin.fr/finder/search',
    //         jar: options.session.cookieJar,
    //         headers: options.session.getHeader(),
    //         json: bodyParams,
    //         gzip: true
    //       },
    //       function optionalCallback(err, httpResponse, jsonResult) {
    //         if (err || httpResponse.statusCode >= 400) {
    //           return reject(
    //             err ||
    //               new Error(
    //                 `HTTP err : ${httpResponse.statusCode} ${httpResponse.statusMessage}`
    //               )
    //           );
    //         }
    //         if (!jsonResult || !jsonResult.ads) {
    //           return reject(new Error('Invalid response - no ads received'));
    //         }
    //         var results = parseData(jsonResult.ads);
    //         var output = {
    //           page: self.page,
    //           pages: Math.ceil(jsonResult.total / self.limit),
    //           nbResult: results.length,
    //           results: results
    //         };
    //         resolve(output);
    //       }
    //     );
    //   });
  }
};
