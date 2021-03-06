import * as Sentry from "@sentry/browser"
import Vue from "vue"

export default ({ node }) => {
  const state = {
    loading: false,
    error: null,
    loaded: false,
    deposits: {}
  }

  const mutations = {
    setProposalDeposits(state, proposalId, deposits) {
      Vue.set(state.deposits, proposalId, deposits)
    }
  }
  const actions = {
    async getProposalDeposits({ state, commit, rootState }, proposalId) {
      state.loading = true

      if (!rootState.connection.connected) return

      try {
        const deposits = await node.getProposalDeposits(proposalId)
        state.error = null
        state.loading = false
        state.loaded = true
        commit(`setProposalDeposits`, proposalId, deposits)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error fetching deposits on proposals`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }
    },
    async submitDeposit(
      {
        rootState: { wallet },
        dispatch
      },
      { proposal_id, amount, password, submitType }
    ) {
      await dispatch(`sendTx`, {
        type: `postProposalDeposit`,
        to: proposal_id,
        proposal_id,
        depositor: wallet.address,
        amount,
        password,
        submitType
      })
      await dispatch(`getProposalDeposits`, proposal_id)
      await dispatch(`getProposal`, proposal_id)
    }
  }
  return {
    state,
    actions,
    mutations
  }
}
