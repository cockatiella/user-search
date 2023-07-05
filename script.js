new Vue({
    el: '#app',
    data() {
        return {
            search: localStorage.getItem('search') || '',
            users: [],
            displayedUsers: [],
            currentPage: parseInt(localStorage.getItem('currentPage')) || 1,
            resultsPerPage: 25,
            scrollThreshold: 200,
            isLoadingMore: false,
            filterGender: localStorage.getItem('filterGender') || '',
            selectedUser: null,
        };
    },
    computed: {
        filteredUsers() {
            let filtered = this.users;
            if (this.search) {
                filtered = filtered.filter(user => {
                    const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
                    return fullName.includes(this.search.toLowerCase());
                });
            }
            if (this.filterGender) {
                filtered = filtered.filter(user => user.gender === this.filterGender);
            }
            return filtered;
        },
        hasMoreResults() {
            return this.displayedUsers.length >= this.filteredUsers.length;
        },
    },
    methods: {
        capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        fetchUsers() {
            axios
                .get(`https://randomuser.me/api/?results=${this.resultsPerPage}`)
                .then(response => {
                    this.users = response.data.results;
                    this.displayedUsers = this.users.slice(0, this.resultsPerPage);
                })
                .catch(error => {
                    console.error(error);
                });
        },
        filterUsers() {
            this.displayedUsers = this.filteredUsers.slice(0, this.resultsPerPage);
            this.currentPage = 1;
            localStorage.setItem('search', this.search);
            localStorage.setItem('filterGender', this.filterGender);
        },
        loadMoreResults() {
            const startIndex = this.currentPage * this.resultsPerPage;
            const endIndex = startIndex + this.resultsPerPage;

            this.isLoadingMore = true; // Set isLoadingMore to true before the timeout

            setTimeout(() => {
                this.displayedUsers = this.displayedUsers.concat(
                    this.filteredUsers.slice(startIndex, endIndex)
                );
                this.currentPage++;
                this.isLoadingMore = false;
            }, 1000); // Simulating a delay to showcase loading state
        },
        showUserDetails(user) {
            this.selectedUser = user;
        },
    },
    mounted() {
        // Fetch users from the API
        this.fetchUsers();

        // Add scroll event listener to the window
        window.addEventListener('scroll', this.handleScroll);

        // Retrieve selected user from local storage
        this.selectedUser = JSON.parse(localStorage.getItem('selectedUser'));
    },
    beforeDestroy() {
        // Remove scroll event listener from the window
        window.removeEventListener('scroll', this.handleScroll);

        // Store selected user in local storage
        localStorage.setItem('selectedUser', JSON.stringify(this.selectedUser));
    },
    destroyed() {
        // Clear selected user
        this.selectedUser = null;
    },
});