/**
 * A SpatialNavigator can be locked by:
 *   - PARENT:
 *      - if the Page is not active (behind in the navigation stack) it tells SpatialNavigationRoot to lock
 *      - if the menu is open, Page tells SpatialNavigationRoot to lock
 *   - MODAL:
 *      - if a modal is open on that page, Modal tells its parent SpatialNavigationRoot to lock
 */
export type LockReason = 'PARENT' | 'MODAL'
