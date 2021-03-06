/**
import publicLoader from './.cache/loader';
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
const fetch = require("node-fetch")
const csv2json = require("csvtojson")
const path = require("path")
const ae = require("./ae")
const gn = require("./gn")
const poster = require("./poster-gallery")
const GOOGLE_SPREADSHEET_ID = "14kreo2vRo1XCUXqFLcMApVtYmvkEzWBDm6b8fzJNKEc"
const SHEET_SHOP_MASTER = "shop_master"
const SHEET_ALERT_MASTER = "alert"
const SHEET_DAILY_STATS_MASTER = "daily_stats"
const LANGUAGES = ["zh", "en"]
const { getPath, getWarTipPath } = require("./src/utils/urlHelper")

const PUBLISHED_SPREADSHEET_HIGH_RISK_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRbmRntCQ1cNkKd5eL3ZVBfgqX_lvQIdJIWxTTQdvSHd_3oIj_6yXOp48qAKdi-Pp-HqXdrrz1gysUr/pub?gid=0"
const PUBLISHED_SPREADSHEET_WARS_CASES_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSr2xYotDgnAq6bqm5Nkjq9voHBKzKNWH2zvTRx5LU0jnpccWykvEF8iB_0g7Tzo2pwzkTuM3ETlr_h/pub?gid=0"
const PUBLISHED_SPREADSHEET_DODGY_SHOPS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_CejomuSCl7198EZ7JgujiAfcxwao-4_X5d3V8VasBKGTvSVtfPrFCl3NGMEwo_a6wZbmKZcqV-sB/pub?gid=1018551822"
const PUBLISHED_SPREADSHEET_WARS_TIPS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6Zri9Rt6egCzKgs2PBdyCpEECI338XZ3UwqJqfEpffW6tnlterGLRne8uS1EKy6tS_Ba4u5OKitmP/pub?gid=0"

const createAENode = async ({
  actions: { createNode },
  createNodeId,
  createContentDigest,
}) => {
  const type = "AEWaitingTime"
  const output = await ae.fetchAEWaitingTime()
  const { records } = output
  records.forEach((p, i) => {
    const meta = {
      id: createNodeId(`${type.toLowerCase()}-${i}`),
      parent: null,
      children: [],
      internal: {
        type,
        contentDigest: createContentDigest(p),
      },
    }
    const node = Object.assign({}, p, meta)
    createNode(node)
  })
}

const createGNNode = async ({
  actions: { createNode },
  createNodeId,
  createContentDigest,
}) => {
  const type = "GoogleNews"
  const output = await gn.fetchGoogleNews()
  const { records } = output
  records.forEach((p, i) => {
    const meta = {
      id: createNodeId(`${type.toLowerCase()}-${i}`),
      parent: null,
      children: [],
      internal: {
        type,
        contentDigest: createContentDigest(p),
      },
    }
    const node = Object.assign({}, p, meta)
    createNode(node)
  })
}

const createGovNewsNode = async ({
  actions: { createNode },
  createNodeId,
  createContentDigest,
}) => {
  const type = "GovNews"
  const output = await gn.fetchGovNews()
  const { records } = output
  records.forEach((p, i) => {
    const meta = {
      id: createNodeId(`${type.toLowerCase()}-${i}`),
      parent: null,
      children: [],
      internal: {
        type,
        contentDigest: createContentDigest(p),
      },
    }
    const node = Object.assign({}, p, meta)
    createNode(node)
  })
}

const createPosterNode = async ({
  actions: { createNode },
  createNodeId,
  createContentDigest,
}) => {
  const type = "PosterGallery"
  const output = await poster.fetchCollactionPosterGallery()
  const { galleries } = output
  galleries.forEach((p, i) => {
    const meta = {
      id: createNodeId(`${type.toLowerCase()}-${i}`),
      parent: null,
      children: [],
      internal: {
        type,
        contentDigest: createContentDigest(p),
      },
    }
    const node = Object.assign({}, p, meta)
    createNode(node)
  })
}

const createNode = async (
  { actions: { createNode }, createNodeId, createContentDigest },
  sheetName,
  type
) => {
  // All table has first row reserved
  const result = await fetch(
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}&range=A2:ZZ&headers=0`
  )
  const data = await result.text()
  const records = await csv2json().fromString(data)
  records.forEach((p, i) => {
    // create node for build time data example in the docs
    const meta = {
      // required fields
      id: createNodeId(`${type.toLowerCase()}-${i}`),
      parent: null,
      children: [],
      internal: {
        type,
        contentDigest: createContentDigest(p),
      },
    }
    const node = Object.assign({}, p, meta)
    createNode(node)
  })
}

const createPublishedGoogleSpreadsheetNode = async (
  { actions: { createNode }, createNodeId, createContentDigest },
  publishedURL,
  type,
  { skipFirstLine = false }
) => {
  // All table has first row reserved
  const result = await fetch(
    `${publishedURL}&single=true&output=csv&headers=0${
      skipFirstLine ? "&range=A2:ZZ" : ""
    }`
  )
  const data = await result.text()
  const records = await csv2json().fromString(data)
  records
    .filter(r => r.enabled === "Y")
    .forEach((p, i) => {
      // create node for build time data example in the docs
      const meta = {
        // required fields
        id: createNodeId(`${type.toLowerCase()}-${i}`),
        parent: null,
        children: [],
        internal: {
          type,
          contentDigest: createContentDigest(p),
        },
      }
      const node = Object.assign({}, p, meta)
      createNode(node)
    })
}

/* 
  =============== Gatsby API starts =================
*/

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage, deletePage } = actions
  return new Promise(resolve => {
    deletePage(page)
    LANGUAGES.forEach(lang => {
      createPage({
        ...page,
        path: getPath(lang, page.path),
        context: {
          ...page.context,
          locale: lang,
        },
      })
    })
    resolve()
  })
}

exports.sourceNodes = async props => {
  await Promise.all([
    createPublishedGoogleSpreadsheetNode(
      props,
      PUBLISHED_SPREADSHEET_HIGH_RISK_URL,
      "HighRisk",
      { skipFirstLine: true }
    ),
    createPublishedGoogleSpreadsheetNode(
      props,
      PUBLISHED_SPREADSHEET_WARS_CASES_URL,
      "WarsCase",
      { skipFirstLine: true }
    ),
    createPublishedGoogleSpreadsheetNode(
      props,
      PUBLISHED_SPREADSHEET_DODGY_SHOPS_URL,
      "DodgyShop",
      { skipFirstLine: true }
    ),
    createPublishedGoogleSpreadsheetNode(
      props,
      PUBLISHED_SPREADSHEET_WARS_TIPS_URL,
      "WarsTip",
      { skipFirstLine: true }
    ),
    createNode(props, SHEET_SHOP_MASTER, "Shop"),
    createNode(props, SHEET_ALERT_MASTER, "Alert"),
    createNode(props, SHEET_DAILY_STATS_MASTER, "DailyStats"),
    createAENode(props),
    createGNNode(props),
    createGovNewsNode(props),
    createPosterNode(props),
  ])
}

exports.createPages = async ({ graphql, actions }) => {
  actions.createRedirect({
    fromPath: `/en/hygiene-tips`,
    toPath: `/en/wars-tips`,
    redirectInBrowser: true,
    isPermanent: true,
  })

  actions.createRedirect({
    fromPath: `/hygiene-tips`,
    toPath: `/wars-tips`,
    redirectInBrowser: true,
    isPermanent: true,
  })

  const result = await graphql(`
    query {
      allWarsTip {
        edges {
          node {
            title
            text
            date
            image_url
            source_description
            source_url
            tags
            language
          }
        }
      }
    }
  `)
  result.data.allWarsTip.edges.forEach(({ node }) => {
    // This will not trigger onCreatePage
    LANGUAGES.forEach(lang => {
      const uri = getWarTipPath(lang, node.title)
      if (node.lang !== lang) {
        actions.createRedirect({
          fromPath: uri,
          toPath: getPath(lang, "/wars-tips"),
          redirectInBrowser: true,
          isPermanent: false,
        })
      } else {
        actions.createPage({
          path: uri,
          component: path.resolve(`./src/templates/wars-tip.js`),
          context: {
            // Data passed to context is available
            // in page queries as GraphQL variables.
            node,
            locale: lang,
            uri,
          },
        })
      }
    })
  })
}
