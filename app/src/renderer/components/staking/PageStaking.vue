<template>
  <tm-page
    :tabs="tabs"
    :refresh="getDelegates"
    class="staking"
    data-title="Staking"
  >
    <router-view />
  </tm-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import TmPage from "common/TmPage"

export default {
  name: `page-staking`,
  components: { TmPage },
  data: () => ({
    query: ``,
    tabs: [
      {
        displayName: `My Delegations`,
        pathName: `My Delegations`
      },
      {
        displayName: `Validators`,
        pathName: `Validators`
      },
      {
        displayName: `Parameters`,
        pathName: `Staking Parameters`
      }
    ]
  }),
  computed: {
    ...mapGetters([`connected`, `delegates`, `filters`, `session`])
  },
  methods: {
    ...mapActions([`getDelegates`])
  }
}
</script>
