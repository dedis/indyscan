import React, { Component } from 'react'
import '../scss/style.scss'
import TxsChart from '../components/TxChart/TxChart'
import { getTransactions, getTxTimeseries, getNetwork } from 'indyscan-api'
import { getBaseUrl } from '../routing'
import { Grid, GridColumn, GridRow } from 'semantic-ui-react'
import PageHeader from '../components/PageHeader/PageHeader'
import TxPreviewList from '../components/TxPreviewList/TxPreviewList'
import Footer from '../components/Footer/Footer'

class HomePage extends Component {

  static async getInitialProps ({req, query}) {
    const baseUrl = getBaseUrl(req)
    const {network} = query
    const networkDetails = await getNetwork(baseUrl, network)
    console.log(`Get initial props for home ... network = ${network}`)
    console.log(`Get initial props for home ... network details = ${JSON.stringify(networkDetails)}`)
    const domainTxs = await getTransactions(baseUrl, network, 'domain', 0, 13)
  // ).map(m=>m[0]*1000)
    const utimeNow = Math.floor(new Date() / 1000)
    const secsInDay = 3600*24
    const dayAgo = (utimeNow - secsInDay*7)
    console.log(`Day ago ${dayAgo}`)
    console.log(`Now ${utimeNow}`)
    const timeseriesDomain = (await getTxTimeseries(baseUrl, network, 'domain', 3600, dayAgo, utimeNow)).map(m=>[m[0]*1000, m[1]])
    const timeseriesPool = (await getTxTimeseries(baseUrl, network, 'pool', 3600, dayAgo, utimeNow)).map(m=>[m[0]*1000, m[1]])
    const timeseriesConfig = (await getTxTimeseries(baseUrl, network, 'config', 3600, dayAgo, utimeNow)).map(m=>[m[0]*1000, m[1]])
    // todo: cache the data...
    return {
      networkDetails,
      network,
      txs: domainTxs.txs,
      timeseriesDomain,
      timeseriesPool,
      timeseriesConfig,
      baseUrl
    }
  }

  render () {
    const {network, networkDetails, baseUrl} = this.props
    console.log('JSON.stringify(networkDetails)')
    console.log(JSON.stringify(networkDetails))
    return (
      <Grid>
        <GridRow style={{backgroundColor: 'white', marginBottom: '-1em'}}>
          <GridColumn width={16}>
            <PageHeader page="home" network={network} baseUrl={baseUrl}/>
          </GridColumn>
        </GridRow>
        <GridRow>
          <p>
          {
            (networkDetails.description) &&
            <h3>{networkDetails.description}</h3>
          }
          </p>
        </GridRow>
        <GridRow>
          <GridColumn width={10} floated='left'>
            <Grid>
              <GridRow>
                <GridColumn>
                  <TxsChart label="Domain tx count" color="darkcyan" type="domain"
                            timeseries={this.props.timeseriesDomain}/>
                  <TxsChart label="Pool tx count" color="mediumaquamarine" type="pool"
                            timeseries={this.props.timeseriesPool}/>
                  <TxsChart label="Config tx count" color="dodgerblue" type="config"
                            timeseries={this.props.timeseriesConfig}/>
                </GridColumn>
              </GridRow>
            </Grid>
          </GridColumn>
          <GridColumn width={6} floated='right' style={{paddingLeft: '7em'}}>
            <GridRow centered>
              <h2>Last domain transactions</h2>
            </GridRow>
            <GridRow centered style={{marginTop: '2em'}}>
              <Grid.Column>
                <TxPreviewList txs={this.props.txs} network={network}/>
              </Grid.Column>
            </GridRow>
          </GridColumn>

        </GridRow>
        <GridRow>
          <GridColumn>
            <Footer/>
          </GridColumn>
        </GridRow>
      </Grid>
    )
  }
}

export default HomePage