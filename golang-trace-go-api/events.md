#Events

## receive

RouteCreated
- id
- distance
- directions
-- lat
-- lng

### execute and return other event when RoutCreated in Nest

FreightCalculated
- route_id
- amount

---

DeliveryStarted
- route_id

### return other event

DriverMoved
- route_id
- lat
- lng