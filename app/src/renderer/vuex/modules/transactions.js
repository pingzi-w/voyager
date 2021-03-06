import { uniqBy } from "lodash"
import * as Sentry from "@sentry/browser"
import Vue from "vue"
export default ({ node }) => {
  const emptyState = {
    loading: false,
    loaded: false,
    error: null,
    wallet: [], // {height, result: { gas, tags }, tx: { type, value: { fee: { amount: [{denom, amount}], gas}, msg: {type, inputs, outputs}}, signatures} }}
    staking: [],
    governance: []
  }
  const state = JSON.parse(JSON.stringify(emptyState))

  // properties under which txs of different categories are stored
  const txCategories = [`staking`, `wallet`, `governance`]

  const mutations = {
    setWalletTxs(state, txs) {
      Vue.set(state, `wallet`, txs)
    },
    setStakingTxs(state, txs) {
      Vue.set(state, `staking`, txs)
    },
    setGovernanceTxs(state, txs) {
      Vue.set(state, `governance`, txs)
    },
    setHistoryLoading(state, loading) {
      Vue.set(state, `loading`, loading)
    },
    setTransactionTime(state, { blockHeight, blockMetaInfo }) {
      txCategories.forEach(category => {
        state[category].forEach(t => {
          if (t.height === blockHeight && blockMetaInfo) {
            // time seems to be an ISO string, but we are expecting a Number type
            Vue.set(t, `time`, new Date(blockMetaInfo.header.time).getTime())
          }
        })
      })
    }
  }

  const actions = {
    resetSessionData({ rootState }) {
      // clear previous account state
      rootState.transactions = JSON.parse(JSON.stringify(emptyState))
    },
    async reconnected({ state, dispatch, rootState }) {
      // TODO: remove signedIn check when we support the option for setting a custom address for txs page
      if (state.loading && rootState.session.signedIn) {
        await dispatch(`getAllTxs`)
      }
    },
    async getAllTxs({ commit, dispatch, state, rootState }) {
      try {
        commit(`setHistoryLoading`, true)

        if (!rootState.connection.connected) return

        const stakingTxs = await dispatch(`getTx`, `staking`)
        commit(`setStakingTxs`, stakingTxs)

        const governanceTxs = await dispatch(`getTx`, `governance`)
        commit(`setGovernanceTxs`, governanceTxs)

        const walletTxs = await dispatch(`getTx`, `wallet`)
        commit(`setWalletTxs`, walletTxs)

        const allTxs = stakingTxs.concat(governanceTxs.concat(walletTxs))
        await dispatch(`enrichTransactions`, {
          transactions: allTxs
        })
        state.error = null
        commit(`setHistoryLoading`, false)
        state.loaded = true
      } catch (error) {
        commit(`notifyError`, {
          title: `Error getting transactions`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }
    },
    async getTx(
      {
        rootState: {
          session: { address }
        }
      },
      type
    ) {
      let response
      switch (type) {
        case `staking`:
          response = await node.getDelegatorTxs(address)
          break
        case `governance`:
          response = await node.getGovernanceTxs(address)
          break
        case `wallet`:
          response = await node.txs(address)
          break
        default:
          throw new Error(`Unknown transaction type`)
      }
      const transactionsPlusType = response.map(t => ({ ...t, type }))
      return response ? uniqBy(transactionsPlusType, `txhash`) : []
    },
    async enrichTransactions({ dispatch }, { transactions }) {
      const blockHeights = new Set(
        transactions.map(({ height }) => parseInt(height))
      )
      await Promise.all(
        [...blockHeights].map(blockHeight =>
          dispatch(`queryTransactionTime`, { blockHeight })
        )
      )
    },
    async queryTransactionTime({ commit, dispatch }, { blockHeight }) {
      const blockMetaInfo = await dispatch(`queryBlockInfo`, blockHeight)
      commit(`setTransactionTime`, {
        blockHeight,
        blockMetaInfo
      })
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
