import React from "react"
import SEO from "@/components/templates/SEO"
import Layout from "@components/templates/Layout"
import { useTranslation } from "react-i18next"
import { Typography } from "@material-ui/core"
import { graphql } from "gatsby"
import EpidemicChart from "@/components/charts/StackedBarChart"

const ChartsPage = ({ data, location }) => {
  const listDate = []
  const startDate = "2020-01-18"
  const date1 = new Date(startDate)
  const date2 = new Date()
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const dateMove = new Date(startDate)
  const strDate = startDate
  let d = startDate
  let k = diffDays
  while (k > 0){
    d = dateMove.toISOString().slice(0,10)
    console.log(d)
    listDate.push(d)
    dateMove.setDate(dateMove.getDate()+1)
    k--
  }

  console.log(listDate)
  const { t } = useTranslation()
  const transformedInitialData = listDate.reduce((result, d) => {
    result[d] = {
      imported: 0, 
      imported_close_contact:0, 
      local_possibly: 0,
      local: 0,
      local_close_contact: 0,
      local_possibly_close_contact: 0,
      label: d
    }
    return result
  },{})
  const transformedData = data.allWarsCase.edges.reduce((result, {node}) => {
    if (node.classification != "-" && node.onset_date.toLowerCase() != "asymptomatic") {
      result[node.onset_date][node.classification]++
    }
    return result
  }, transformedInitialData)
  return (
    <Layout noPadding={true}>
      <SEO title="Charts" />
      <Typography variant="h2">{t("epidemic.title")}</Typography>
      <EpidemicChart
        keys={[
          "imported",
          "imported_close_contact",
          "local",
          "local_close_contact",
          "local_possibly",
          "local_possibly_close_contact"
        ]}
        keyToLabel={key => {
          return t(`epidemic_chart.key_${key}`)
        }}
        data={Object.values(transformedData)}
      />
    </Layout>
  )
}

export default ChartsPage

export const ChartsQuery = graphql`
  query {
    allWarsCase(
      sort: { order: DESC, fields: case_no }
      filter: { enabled: { eq: "Y" } }
    ) {
      edges {
        node {
          case_no
          onset_date
          confirmation_date
          gender
          age
          hospital_zh
          hospital_en
          status
          status_zh
          status_en
          type_zh
          type_en
          citizenship_zh
          citizenship_en
          detail_zh
          detail_en
          classification
          classification_zh
          classification_en
          source_url
        }
      }
    }
  }
`
