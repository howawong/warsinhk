import React, { useState } from "react"
import SEO from "@/components/templates/SEO"
import Layout from "@components/templates/Layout"
import Box from "@material-ui/core/Box"
import Link from "@material-ui/core/Link"
import { UnstyledCardLink } from "@components/atoms/UnstyledLink"
import styled from "styled-components"
import { useTranslation } from "react-i18next"
import Typography from "@material-ui/core/Typography"
import { graphql } from "gatsby"
import { BasicCard } from "@components/atoms/Card"
import { TextField, InputAdornment } from "@material-ui/core/"
import SearchIcon from "@material-ui/icons/Search"
import { trackCustomEvent } from "gatsby-plugin-google-analytics"
import Select from "react-select"
import makeAnimated from "react-select/animated"
import { Row, FlexStartRow } from "@components/atoms/Row"
import { Label } from "@components/atoms/Text"

import { withLanguage } from "../utils/i18n"
import { bps } from "../ui/theme"
// import { BasicFab } from "@components/atoms/Fab"
// const FabContainer = styled(Box)`
//   && {
//     bottom: 84px;
//     right: 16px;
//     position: fixed;
//     z-index: 1200;

//     ${bps.up("md")} {
//       bottom: 16px;
//     }
//   }
// `

const ShopDetail = styled(Typography)`
  margin-top: 8px;
  font-size: 14px;
  color: ${props => props.theme.palette.secondary.main};
  line-height: 1.33rem;
`

const DubiousShopLabel = styled(Box)`
  background: black;
  color: white;
  padding: 4px 6px 4px;
`

const animatedComponents = makeAnimated()

const SearchBox = styled(TextField)`
  && {
    ${bps.down("md")} {
      margin-top: 8px;
      margin-bottom: 8px;
      width: 100%;
    }
  }
`

function item(props, i18n, t) {
  const { node } = props

  const sourceUrl = node.source_url

  return (
    <UnstyledCardLink
      href={`https://maps.google.com/?q=${withLanguage(i18n, node, "address")}`}
      target="_blank"
    >
      <Row>
        <Box>{withLanguage(i18n, node, "type")}</Box>
        <DubiousShopLabel>
          {t(`dodgy_shops.category_${node.category}`)}
        </DubiousShopLabel>
      </Row>
      <Row>
        <Box>{withLanguage(i18n, node, "address")}</Box>
      </Row>
      <Row>
        <Typography variant="h6">{withLanguage(i18n, node, "name")}</Typography>
      </Row>
      <FlexStartRow>
        <Box>
          <Label>{t("dodgy_shops.price")}</Label>
          {node.mask_price_per_box || "-"}
        </Box>
        <Box>
          <Label>{t("dodgy_shops.level")}</Label>
          {withLanguage(i18n, node, "mask_level") || "-"}
        </Box>
      </FlexStartRow>

      <Row>
        <ShopDetail component="p">
          {withLanguage(i18n, node, "details")}
        </ShopDetail>
      </Row>
      <FlexStartRow>
        {sourceUrl && (
          <Typography component="div" variant="body2">
            <Link component={Link} href={sourceUrl} target="_blank">
              {t("dodgy_shops.source")}
            </Link>
          </Typography>
        )}
      </FlexStartRow>
      <Row>
        <Box>{t("dodgy_shops.last_updated", { date: node.last_update })}</Box>
      </Row>
    </UnstyledCardLink>
  )
}

function containsText(i18n, node, text) {
  return (
    withLanguage(i18n, node, "district").indexOf(text) >= 0 ||
    withLanguage(i18n, node, "sub_district").indexOf(text) >= 0 ||
    withLanguage(i18n, node, "name").indexOf(text) >= 0 ||
    withLanguage(i18n, node, "address").indexOf(text) >= 0
  )
}

function isInSubDistrict(i18n, node, textList) {
  if (typeof textList === "string") return
  return (
    textList &&
    textList.some(
      optionObj =>
        withLanguage(i18n, node, "sub_district").indexOf(optionObj.value) >= 0
    )
  )
}

function createSubDistrictOptionList(allData, i18n) {
  let subDistrictArray = allData
    .map(({ node }) => withLanguage(i18n, node, "sub_district"))
    .filter(district => district !== "-")

  let optionList = []

  subDistrictArray
    .filter((a, b) => subDistrictArray.indexOf(a) === b)
    .forEach(value => {
      optionList.push({
        value: value,
        label: value,
      })
    })

  return optionList
}

const ShopsPage = props => {
  const { data } = props
  const { i18n, t } = useTranslation()
  const [filter, setFilter] = useState("")

  const subDistrictOptionList = createSubDistrictOptionList(
    data.allDodgyShop.edges,
    i18n
  )

  return (
    <>
      <SEO title="Home" />
      <Layout>
        {/* <FabContainer>
          <Link href="https://forms.gle/gK477bmq8cG57ELv8" target="_blank">
            <BasicFab title={t("dodgy_shops.report_incident")} icon="edit" />
          </Link>
        </FabContainer> */}
        <Typography variant="h4">{t("dodgy_shops.list_text")}</Typography>
        <>
          <Select
            closeMenuOnSelect={false}
            components={animatedComponents}
            isMulti
            placeholder={t("dodgy_shops.filter_by_district_text")}
            options={subDistrictOptionList}
            onChange={selectedArray => {
              setFilter(selectedArray || "")
            }}
          />
          <SearchBox
            id="input-with-icon-textfield"
            placeholder={t("dodgy_shops.filter_text")}
            onChange={e => {
              trackCustomEvent({
                category: "dodgy_shop",
                action: "filter_input",
                label: e.target.value,
              })
              setFilter(e.target.value)
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </>
        {data.allDodgyShop.edges
          .filter(
            e =>
              filter === "" ||
              containsText(i18n, e.node, filter) ||
              isInSubDistrict(i18n, e.node, filter)
          )
          .map((node, index) => (
            <BasicCard
              alignItems="flex-start"
              key={index}
              children={item(node, i18n, t)}
            />
          ))}
      </Layout>
    </>
  )
}

export default ShopsPage

export const ShopsQuery = graphql`
  query {
    allDodgyShop(
      filter: { enabled: { eq: "Y" } }
      sort: { order: DESC, fields: last_update }
    ) {
      edges {
        node {
          category
          name_zh
          name_en
          address_zh
          address_en
          sub_district_zh
          sub_district_en
          district_zh
          district_en
          area_zh
          area_en
          mask_price_per_box
          mask_level_zh
          mask_level_en
          details_zh
          details_en
          last_update
          type_zh
          type_en
          source_zh
          source_en
          source_url
          lat
          lng
        }
      }
    }
  }
`
