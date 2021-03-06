<template>
  <div>
    <div v-if="delegation.loaded && yourValidators.length > 0">
      <table-validators :validators="yourValidators" />
    </div>
    <tm-data-connecting v-if="!delegation.loaded && !connected" />
    <tm-data-loading v-else-if="!delegation.loaded && delegation.loading" />
    <tm-data-msg v-else-if="yourValidators.length === 0" icon="info_outline">
      <div slot="title">
        No Active Delegations
      </div>
      <div slot="subtitle">
        Looks like you haven't delegated any {{ bondDenom }}s yet. Head over to
        the
        <router-link :to="{ name: 'Validators' }">
          validator list
        </router-link>
        to make your first delegation!
      </div>
    </tm-data-msg>
    <div v-if="delegation.loaded && unbondingTransactions.length > 0">
      <h3 class="tab-header transactions">
        Pending Undelegations
      </h3>
      <div class="unbonding-transactions">
        <template v-for="transaction in unbondingTransactions">
          <tm-li-stake-transaction
            :key="transaction.hash"
            :transaction="transaction"
            :validators="yourValidators"
            :bonding-denom="bondDenom"
            :url="validatorURL"
            :unbonding-time="
              time.getUnbondingTime(
                transaction,
                delegation.unbondingDelegations
              )
            "
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TmLiStakeTransaction from "../transactions/TmLiStakeTransaction"
import TmDataMsg from "common/TmDataMsg"
import TmDataLoading from "common/TmDataLoading"
import TableValidators from "staking/TableValidators"
import TmDataConnecting from "common/TmDataConnecting"
import time from "scripts/time"

export default {
  name: `tab-my-delegations`,
  components: {
    TableValidators,
    TmDataMsg,
    TmDataConnecting,
    TmDataLoading,
    TmLiStakeTransaction
  },
  data: () => ({
    unbondTransactions: `Transactions currently in the undelegation period`,
    validatorURL: `/staking/validators`,
    time
  }),
  computed: {
    ...mapGetters([
      `allTransactions`,
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `bondDenom`,
      `connected`
    ]),
    yourValidators({ committedDelegations, delegates: { delegates } } = this) {
      return delegates.filter(
        ({ operator_address }) => operator_address in committedDelegations
      )
    },
    unbondingTransactions: ({ allTransactions, delegation } = this) =>
      allTransactions
        .filter(
          transaction =>
            // Checking the type of transaction
            transaction.tx.value.msg[0].type === `cosmos-sdk/BeginUnbonding` &&
            // getting the unbonding time and checking if it has passed already
            time.getUnbondingTime(
              transaction,
              delegation.unbondingDelegations
            ) >= Date.now()
        )
        .map(transaction => ({
          ...transaction,
          unbondingDelegation:
            delegation.unbondingDelegations[
              transaction.tx.value.msg[0].value.validator_addr
            ]
        }))
  }
}
</script>
<style>
.tab-header {
  color: var(--dim);
  font-size: 14px;
  font-weight: 500;
  margin: 3rem 0.5rem 0.5rem;
}

.info-button {
  color: var(--link);
}

.unbonding-transactions .tm-li-tx::before {
  position: absolute;
  width: 2rem;
  text-align: right;
  color: var(--dim);
  left: 0;
}
</style>
